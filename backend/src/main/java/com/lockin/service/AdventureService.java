package com.lockin.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.lockin.model.*;
import com.lockin.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdventureService {

    private final AdventureSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final UserStatRepository userStatRepository;
    private final UserItemRepository userItemRepository;
    private final QuestRepository questRepository;
    
    // Spring boot rest client
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${ai.game.master.url:http://localhost:8000/api/adventure}")
    private String aiApiUrl;

    public AdventureService(AdventureSessionRepository sessionRepository,
                            UserRepository userRepository,
                            UserStatRepository userStatRepository,
                            UserItemRepository userItemRepository,
                            QuestRepository questRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.userStatRepository = userStatRepository;
        this.userItemRepository = userItemRepository;
        this.questRepository = questRepository;
    }

    @Transactional
    public AdventureSession startAdventure(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If an active session exists, return it
        Optional<AdventureSession> active = sessionRepository.findByUserAndIsActiveTrue(user);
        if (active.isPresent()) {
            return active.get();
        }

        // Generate base HP from VIT stat
        int vit = getStatValue(user, "VIT");
        int maxHp = 50 + (vit * 10);

        AdventureSession session = new AdventureSession();
        session.setUser(user);
        session.setHp(maxHp);
        session.setMaxHp(maxHp);
        session.setActive(true);
        session.setContextHistory("The hero begins a new campaign.");
        
        // Build payload for AI
        Map<String, Object> payload = buildAiPayload(session, null);
        
        // Call Python AI
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(aiApiUrl + "/generate", payload, JsonNode.class);
        JsonNode body = response.getBody();
        if (body != null) {
            String narrative = body.has("narrative") ? body.get("narrative").asText() : "A new path emerges...";
            session.setContextHistory(session.getContextHistory() + "\n" + narrative);
            
            // Save last options
            if (body.has("options") && body.get("options").isArray()) {
                List<String> opts = new ArrayList<>();
                body.get("options").forEach(opt -> opts.add(opt.asText()));
                session.setLastOptions(String.join("|", opts));
            }
            
            // Handle image logic if configured (AI returns "image_prompt")
            // Here you would call pollinations or a generative service and save the URL.
            // For now, we will wait until Python actually returns the image prompt.
            
            session = sessionRepository.save(session);
        }
        
        return session;
    }

    @Transactional
    public AdventureSession makeChoice(Long userId, String choice) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AdventureSession session = sessionRepository.findByUserAndIsActiveTrue(user)
                .orElseThrow(() -> new RuntimeException("No active adventure found"));
                
        // If there's a pending physical quest locked, don't allow progress
        if (session.getPendingQuestId() != null) {
            throw new RuntimeException("You must complete the assigned Quest in real life before resolving this action!");
        }

        // Build Payload
        Map<String, Object> payload = buildAiPayload(session, choice);
        
        // Call Python Model
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(aiApiUrl + "/resolve", payload, JsonNode.class);
        JsonNode body = response.getBody();
        
        if (body != null) {
            String narrative = body.has("narrative") ? body.get("narrative").asText() : "";
            int hpChange = body.has("hp_change") ? body.get("hp_change").asInt() : 0;
            boolean requiresExercise = body.has("requires_exercise") && body.get("requires_exercise").asBoolean();
            
            // Update Context
            session.setContextHistory(session.getContextHistory() + "\nUser chose: " + choice + "\n" + narrative);
            
            // Apply Damage/Heal
            session.setHp(Math.max(0, Math.min(session.getMaxHp(), session.getHp() + hpChange)));
            
            // Check Death -> Permadeath scenario
            if (session.getHp() <= 0) {
                session.setActive(false); // Rogue-like wipe!
                session.setContextHistory(session.getContextHistory() + "\nYOU DIED. Campaign ended.");
                session.setLastOptions("");
                return sessionRepository.save(session);
            }
            
            // Update UI Options
            if (body.has("options") && body.get("options").isArray()) {
                List<String> opts = new ArrayList<>();
                body.get("options").forEach(opt -> opts.add(opt.asText()));
                session.setLastOptions(String.join("|", opts));
            }
            
            // Lock behind physical quest if requested by GM
            if (requiresExercise) {
                List<Quest> storyQuests = questRepository.findAll().stream()
                        .filter(q -> q.getType() == Quest.QuestType.STORY)
                        .collect(Collectors.toList());
                if (!storyQuests.isEmpty()) {
                    Collections.shuffle(storyQuests);
                    session.setPendingQuestId(storyQuests.get(0).getId());
                }
            }
        }
        
        return sessionRepository.save(session);
    }

    private Map<String, Object> buildAiPayload(AdventureSession session, String choice) {
        User user = session.getUser();
        List<UserStat> stats = userStatRepository.findByUser(user);
        Map<String, Integer> statsMap = new HashMap<>();
        stats.forEach(us -> statsMap.put(us.getStat().getName().toLowerCase(), us.getCurrentValue()));

        List<String> items = userItemRepository.findByUserId(user.getId()).stream()
                .map(ui -> ui.getItem().getName())
                .collect(Collectors.toList());

        Map<String, Object> payload = new HashMap<>();
        payload.put("user_id", user.getId());
        payload.put("hp", session.getHp());
        payload.put("max_hp", session.getMaxHp());
        payload.put("stats", statsMap);
        payload.put("inventory", items);
        payload.put("context_history", session.getContextHistory());
        
        if (choice != null) {
            payload.put("choice", choice);
        }
        
        return payload;
    }

    private int getStatValue(User user, String statName) {
        return userStatRepository.findByUser(user).stream()
                .filter(us -> us.getStat().getName().equalsIgnoreCase(statName))
                .map(UserStat::getCurrentValue)
                .findFirst()
                .orElse(5);
    }

    public Map<String, Integer> getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<UserStat> stats = userStatRepository.findByUser(user);
        Map<String, Integer> statsMap = new LinkedHashMap<>();
        stats.forEach(us -> statsMap.put(us.getStat().getName().toUpperCase(), us.getCurrentValue()));
        return statsMap;
    }

    @Transactional
    public void resetCampaign(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        sessionRepository.findByUserAndIsActiveTrue(user)
                .ifPresent(session -> {
                    session.setActive(false);
                    sessionRepository.save(session);
                });
    }
}
