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
    private final UserLeagueRepository userLeagueRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.game.master.url:http://localhost:8000/api/adventure}")
    private String aiApiUrl;

    public AdventureService(AdventureSessionRepository sessionRepository,
            UserRepository userRepository,
            UserStatRepository userStatRepository,
            UserItemRepository userItemRepository,
            QuestRepository questRepository,
            UserLeagueRepository userLeagueRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.userStatRepository = userStatRepository;
        this.userItemRepository = userItemRepository;
        this.questRepository = questRepository;
        this.userLeagueRepository = userLeagueRepository;
    }

    @Transactional
    public AdventureSession startAdventure(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<AdventureSession> active = sessionRepository.findByUserAndIsActiveTrue(user);
        if (active.isPresent()) {
            return active.get();
        }

        int vit = getStatValue(user, "VIT");
        int maxHp = 50 + (vit * 10);

        AdventureSession session = new AdventureSession();
        session.setUser(user);
        session.setHp(maxHp);
        session.setMaxHp(maxHp);
        session.setActive(true);
        session.setRoomCount(0);
        session.setPastRooms("");
        session.setContextHistory("El héroe comienza una nueva campaña.");

        Map<String, Object> payload = buildAiPayload(session, null);

        ResponseEntity<JsonNode> response = restTemplate.postForEntity(aiApiUrl + "/generate", payload, JsonNode.class);
        JsonNode body = response.getBody();
        if (body != null) {
            String narrative = body.has("narrative") ? body.get("narrative").asText() : "Un nuevo camino emerge...";
            session.setContextHistory(session.getContextHistory() + "\n" + narrative);
            session.setCurrentRoomType(body.has("room_type") ? body.get("room_type").asText() : "UNKNOWN");

            if (body.has("recommended_stats")) {
                session.setRecommendedStats(body.get("recommended_stats").toString());
            }

            if (body.has("options") && body.get("options").isArray()) {
                List<String> opts = new ArrayList<>();
                body.get("options").forEach(opt -> opts.add(opt.asText()));
                session.setLastOptions(String.join("|", opts));
            }

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

        if (session.getPendingQuestId() != null) {
            throw new RuntimeException(
                    "Debes completar la misión asignada en la vida real antes de elegir esta acción!");
        }

        Map<String, Object> payload = buildAiPayload(session, choice);

        ResponseEntity<JsonNode> response = restTemplate.postForEntity(aiApiUrl + "/resolve", payload, JsonNode.class);
        JsonNode body = response.getBody();

        if (body != null) {
            String narrative = body.has("narrative") ? body.get("narrative").asText() : "";
            int hpChange = body.has("hp_change") ? body.get("hp_change").asInt() : 0;
            boolean requiresExercise = body.has("requires_exercise") && body.get("requires_exercise").asBoolean();
            String roomType = body.has("room_type") ? body.get("room_type").asText() : "UNKNOWN";

            // Incrementar contador de salas
            session.setRoomCount(session.getRoomCount() + 1);
            session.setCurrentRoomType(roomType);

            // Actualizar historial de salas (mantener las últimas 5)
            String past = session.getPastRooms();
            List<String> roomList = (past == null || past.isEmpty()) ? new ArrayList<>() : new ArrayList<>(Arrays.asList(past.split(",")));
            roomList.add(roomType);
            if (roomList.size() > 5) roomList.remove(0);
            session.setPastRooms(String.join(",", roomList));

            // Actualizar contexto
            session.setContextHistory(
                    session.getContextHistory() + "\n- Acción: " + choice + "\n- Resultado: " + narrative);

            // Aplicar daño/curación
            session.setHp(Math.max(0, Math.min(session.getMaxHp(), session.getHp() + hpChange)));

            // Check Death -> Permadeath scenario
            if (session.getHp() <= 0) {
                session.setActive(false);
                session.setContextHistory(session.getContextHistory() + "\nMoriste. Fin de la campaña.");
                session.setLastOptions("");
                return sessionRepository.save(session);
            }

            // Actualizar opciones de la UI
            if (body.has("options") && body.get("options").isArray()) {
                List<String> opts = new ArrayList<>();
                body.get("options").forEach(opt -> opts.add(opt.asText()));
                session.setLastOptions(String.join("|", opts));
            }

            // Bloquear una misión física si el GM lo solicita
            if (requiresExercise) {
                String obstacleType = body.has("obstacle_type") ? body.get("obstacle_type").asText() : "NONE";
                
                List<Quest> storyQuests = questRepository.findAll().stream()
                        .filter(q -> q.getType() == Quest.QuestType.STORY)
                        .collect(Collectors.toList());

                if (!storyQuests.isEmpty()) {
                    // Intentar buscar una misión que coincida con el ejercicio sugerido
                    Quest selectedQuest = storyQuests.stream()
                        .filter(q -> q.getSteps().stream()
                            .anyMatch(s -> s.getExercise().getName().equalsIgnoreCase(obstacleType)))
                        .findFirst()
                        .orElse(null);

                    // Si no hay coincidencia exacta, elegir una aleatoria para no bloquear el juego
                    if (selectedQuest == null) {
                        Collections.shuffle(storyQuests);
                        selectedQuest = storyQuests.get(0);
                    }
                    
                    session.setPendingQuestId(selectedQuest.getId());
                }
            }

            if (body.has("recommended_stats")) {
                session.setRecommendedStats(body.get("recommended_stats").toString());
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

        String fullHistory = session.getContextHistory();
        String limitedHistory = limitHistory(fullHistory, 5);
        Map<String, Object> payload = new HashMap<>();
        payload.put("user_id", user.getId());
        payload.put("hp", session.getHp());
        payload.put("max_hp", session.getMaxHp());
        payload.put("stats", statsMap);
        payload.put("inventory", items);
        payload.put("context_history", limitedHistory);
        payload.put("room_count", session.getRoomCount());
        payload.put("past_rooms", session.getPastRooms());

        // Añadir liga actual
        List<UserLeague> userLeagues = userLeagueRepository.findByUser(user);
        if (!userLeagues.isEmpty()) {
            UserLeague ul = userLeagues.get(0);
            payload.put("league", ul.getLeague().getRank());
            session.setCurrentLeague(ul.getLeague().getRank());
        }

        if (choice != null) {
            payload.put("choice", choice);
        }

        return payload;
    }

    private String limitHistory(String history, int lastLines) {
        if (history == null || history.isEmpty())
            return "";

        String[] lines = history.split("\n");
        if (lines.length <= lastLines)
            return history;

        // Unimos solo las últimas 'lastLines'
        return Arrays.stream(lines)
                .skip(lines.length - lastLines)
                .collect(Collectors.joining("\n"));
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

    @Transactional
    public AdventureSession skipQuest(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        AdventureSession session = sessionRepository.findByUserAndIsActiveTrue(user)
                .orElseThrow(() -> new RuntimeException("No active adventure found"));
        
        session.setPendingQuestId(null);
        return sessionRepository.save(session);
    }
}
