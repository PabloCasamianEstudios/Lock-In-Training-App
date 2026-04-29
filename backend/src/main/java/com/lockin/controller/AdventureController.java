package com.lockin.controller;

import com.lockin.model.AdventureSession;
import com.lockin.repository.AdventureSessionRepository;
import com.lockin.repository.UserRepository;
import com.lockin.service.AdventureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/adventure")
public class AdventureController {

    private final AdventureService adventureService;
    private final AdventureSessionRepository sessionRepository;
    private final UserRepository userRepository;

    public AdventureController(AdventureService adventureService,
            AdventureSessionRepository sessionRepository,
            UserRepository userRepository) {
        this.adventureService = adventureService;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/start/{userId}")
    public ResponseEntity<AdventureSession> startAdventure(@PathVariable Long userId) {
        try {
            AdventureSession session = adventureService.startAdventure(userId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/action/{userId}")
    public ResponseEntity<AdventureSession> makeChoice(@PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        try {
            String choice = body.get("choice");
            if (choice == null || choice.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            AdventureSession session = adventureService.makeChoice(userId, choice);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/current/{userId}")
    public ResponseEntity<AdventureSession> getCurrentSession(@PathVariable Long userId) {
        var userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Optional<AdventureSession> session = sessionRepository.findByUserAndIsActiveTrue(userOpt.get());
        return session.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Integer>> getAdventureStats(@PathVariable Long userId) {
        try {
            Map<String, Integer> stats = adventureService.getUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/reset/{userId}")
    public ResponseEntity<Void> resetCampaign(@PathVariable Long userId) {
        try {
            adventureService.resetCampaign(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/skip/{userId}")
    public ResponseEntity<AdventureSession> skipQuest(@PathVariable Long userId) {
        try {
            AdventureSession session = adventureService.skipQuest(userId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/purchase-potion/{userId}")
    public ResponseEntity<?> purchasePotion(@PathVariable Long userId) {
        try {
            AdventureSession session = adventureService.purchasePotion(userId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
