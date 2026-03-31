package com.lockin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.User;
import com.lockin.model.UserAchievement;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    List<UserAchievement> findByUser(User user);
}

