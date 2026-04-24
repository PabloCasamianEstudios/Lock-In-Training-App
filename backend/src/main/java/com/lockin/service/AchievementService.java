package com.lockin.service;

import com.lockin.model.Achievement;
import com.lockin.model.User;
import com.lockin.model.UserAchievement;
import com.lockin.model.UserTitle;
import com.lockin.repository.AchievementRepository;
import com.lockin.repository.UserAchievementRepository;
import com.lockin.repository.UserTitleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private UserTitleRepository userTitleRepository;

    @Transactional
    public List<Achievement> checkAndUnlock(User user) {
        List<Achievement> unlockedThisTime = new ArrayList<>();
        List<Achievement> all = achievementRepository.findAll();
        List<UserAchievement> userAchs = userAchievementRepository.findByUser(user);
        Set<Long> unlockedIds = userAchs.stream()
                .map(ua -> ua.getAchievement().getId())
                .collect(Collectors.toSet());

        for (Achievement a : all) {
            if (!unlockedIds.contains(a.getId())) {
                boolean unlocked = false;

                if (a.getTitle().contains("The Beginning") && user.getLevel() >= 10)
                    unlocked = true;
                if (a.getTitle().contains("Awakening") && user.getLevel() >= 50)
                    unlocked = true;
                if (a.getTitle().contains("Dedicated Hunter") && user.getCompletedWorkouts() >= 50)
                    unlocked = true;
                if (a.getTitle().contains("Apex Predator") && "Diamond".equalsIgnoreCase(user.getRank()))
                    unlocked = true;

                if (unlocked) {
                    UserAchievement ua = new UserAchievement();
                    ua.setUser(user);
                    ua.setAchievement(a);
                    userAchievementRepository.save(ua);
                    unlockedThisTime.add(a);

                    // Assign Title reward if present
                    if (a.getTitleReward() != null) {
                        if (userTitleRepository.findByUserIdAndTitleId(user.getId(), a.getTitleReward().getId())
                                .isEmpty()) {
                            UserTitle ut = new UserTitle();
                            ut.setUser(user);
                            ut.setTitle(a.getTitleReward());
                            ut.setEquipped(false);
                            userTitleRepository.save(ut);
                        }
                    }
                }
            }
        }
        return unlockedThisTime;
    }
}
