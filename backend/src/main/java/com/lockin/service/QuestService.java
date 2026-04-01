package com.lockin.service;

import com.lockin.model.*;
import com.lockin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class QuestService {

    @Autowired
    private UserQuestProgressRepository progressRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProtectionService protectionService;

    /* --- REWARDS & PROGRESSION ZONE --- */
    @Transactional
    public User completeQuest(Long progressId) {
        UserQuestProgress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new RuntimeException("Progreso no encontrado"));

        if ("MUTE".equals(progress.getUser().getRole())) {
            throw new RuntimeException("Tu cuenta ha sido silenciada por actividad sospechosa. No puedes completar misiones.");
        }

        if (progress.getStatus() == UserQuestProgress.QuestStatus.COMPLETED) {
            throw new RuntimeException("Misión ya completada");
        }

        User user = progress.getUser();
        Quest quest = progress.getQuest();

        // Apply Rewards
        user.setXp(user.getXp() + quest.getXpReward());
        user.setCoins(user.getCoins() + quest.getGoldReward());

        // Points increase (scaling with level)
        user.setTotalPoints(user.getTotalPoints() + (quest.getXpReward() / 10));

        // Level-Up Logic (Scaling)
        processLevelUp(user);

        // Update Progress
        progress.setStatus(UserQuestProgress.QuestStatus.COMPLETED);
        progress.setCompletionTime(LocalDateTime.now());

        // ANTI-CHEAT CHECK
        protectionService.validateQuestSpeed(progress);
        protectionService.logActivity(user, UserActivityLog.ActivityType.QUEST_COMPLETED, 1, "Quest ID: " + quest.getId());
        protectionService.logActivity(user, UserActivityLog.ActivityType.XP_GAIN, quest.getXpReward(), "Quest reward");

        progressRepository.save(progress);
        return userRepository.save(user);
    }

    private void processLevelUp(User user) {
        while (true) {
            long xpRequired = calculateRequiredXP(user.getLevel());
            if (user.getXp() >= xpRequired) {
                user.setXp(user.getXp() - xpRequired);
                user.setLevel(user.getLevel() + 1);
                
                // LOG LEVEL UP FOR SECURITY
                protectionService.logActivity(user, UserActivityLog.ActivityType.LEVEL_UP, 1, "Leveled up to " + user.getLevel());
            } else {
                break;
            }
        }
    }

    private long calculateRequiredXP(int level) {
        return (long) (1000 * Math.pow(1.5, level - 1));
    }
}
