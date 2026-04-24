package com.lockin.service;

import com.lockin.model.*;
import com.lockin.repository.UserActivityLogRepository;
import com.lockin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Service
public class ProtectionService {

    @Autowired
    private UserActivityLogRepository activityLogRepository;
    @Autowired
    private UserRepository userRepository;
    @Lazy
    @Autowired
    private ProtectionService self;

    // --- CONFIGURABLE THRESHOLDS ---
    private static final int MAX_QUESTS_PER_MINUTE = 30;
    private static final int MAX_LEVELS_PER_5_MINUTES = 500;
    private static final int MIN_QUEST_DURATION_SECONDS = 1;

    @Transactional
    public void logActivity(User user, UserActivityLog.ActivityType type, double amount, String metadata) {
        if ("MUTE".equals(user.getRole()))
            return;

        UserActivityLog log = new UserActivityLog();
        log.setUser(user);
        log.setType(type);
        log.setAmount(amount);
        log.setMetadata(metadata);
        activityLogRepository.save(log);

        checkIntegrity(user, type);
    }

    public void validateQuestSpeed(UserQuestProgress progress) {
        if (progress.getCompletionTime() == null || progress.getStartTime() == null)
            return;

        long durationSeconds = Duration.between(progress.getStartTime(), progress.getCompletionTime()).getSeconds();

        if (durationSeconds < MIN_QUEST_DURATION_SECONDS) {
            self.muteUser(progress.getUser(), "Misión completada de forma instantánea (" + durationSeconds + "s)");
            throw new RuntimeException("Actividad sospechosa detectada. Proceso de integridad activado.");
        }
    }

    private void checkIntegrity(User user, UserActivityLog.ActivityType type) {
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);

        switch (type) {
            case QUEST_COMPLETED:
                List<UserActivityLog> recentQuests = activityLogRepository
                        .findByTypeAndUserIdAndTimestampAfter(UserActivityLog.ActivityType.QUEST_COMPLETED,
                                user.getId(), oneMinuteAgo);
                if (recentQuests.size() > MAX_QUESTS_PER_MINUTE) {
                    self.muteUser(user, "Exceso de misiones completadas (" + recentQuests.size() + " en 1min)");
                }
                break;

            case LEVEL_UP:
                List<UserActivityLog> recentLevels = activityLogRepository
                        .findByTypeAndUserIdAndTimestampAfter(UserActivityLog.ActivityType.LEVEL_UP, user.getId(),
                                fiveMinutesAgo);
                if (recentLevels.size() > MAX_LEVELS_PER_5_MINUTES) {
                    self.muteUser(user, "Subida de nivel masiva detectada (" + recentLevels.size() + " en 5min)");
                }
                break;

            default:
                break;
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void muteUser(User user, String reason) {
        if ("ADMIN".equals(user.getRole()))
            return;

        System.err.println(
                "ALERT [ANTI-CHEAT]: Muting user " + user.getUsername() + " (ID: " + user.getId() + ") for: " + reason);
        user.setRole("MUTE");
        userRepository.save(user);
    }
}
