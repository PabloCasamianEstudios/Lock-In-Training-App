package com.lockin.controller;

import com.lockin.model.*;
import com.lockin.repository.UserRepository;
import com.lockin.repository.FriendshipRepository;
import com.lockin.repository.UserQuestProgressRepository;
import com.lockin.service.QuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/quests")
public class UserQuestController {

    @Autowired private QuestService questService;
    @Autowired private UserQuestProgressRepository progressRepository;
    @Autowired private FriendshipRepository friendshipRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private com.lockin.repository.QuestRepository questRepository;

    /* --- QUEST PLAYER ACTIONS ZONE --- */
    @PostMapping("/{questId}/start")
    public ResponseEntity<Object> startQuest(@PathVariable Long questId, @RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        Quest quest = questRepository.findById(questId).orElse(null);
        if (user == null || quest == null) return ResponseEntity.status(404).body("Usuario o Quest no encontrada");

        // Check for existing active progress
        List<UserQuestProgress> active = progressRepository.findByUserIdAndStatus(userId, UserQuestProgress.QuestStatus.ACTIVE);
        if (active.stream().anyMatch(p -> p.getQuest().getId().equals(questId))) {
            return ResponseEntity.badRequest().body("Ya tienes esta misión activa");
        }

        UserQuestProgress progress = new UserQuestProgress();
        progress.setUser(user);
        progress.setQuest(quest);
        progress.setStatus(UserQuestProgress.QuestStatus.ACTIVE);
        
        return ResponseEntity.ok(progressRepository.save(progress));
    }

    @GetMapping("/active/{userId}")
    public List<UserQuestProgress> getActiveQuests(@PathVariable Long userId) {
        return progressRepository.findByUserIdAndStatus(userId, UserQuestProgress.QuestStatus.ACTIVE);
    }
    @PostMapping("/progress/{progressId}/complete")
    public ResponseEntity<Object> completeQuest(@PathVariable Long progressId) {
        try {
            User user = questService.completeQuest(progressId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/friends/{targetUserId}/custom")
    public ResponseEntity<Object> getFriendsCustomQuests(@RequestParam Long requesterId, @PathVariable Long targetUserId) {
        Optional<Friendship> friendship = friendshipRepository.findExistingFriendship(requesterId, targetUserId);
        
        if (friendship.isPresent() && friendship.get().getStatus() == Friendship.FriendshipStatus.ACCEPTED) {
            List<UserQuestProgress> custom = progressRepository.findByUserIdAndQuestType(targetUserId, Quest.QuestType.CUSTOM);
            return ResponseEntity.ok(custom);
        } else {
            return ResponseEntity.status(403).body("Solo puedes ver las misiones de tus amigos");
        }
    }
}
