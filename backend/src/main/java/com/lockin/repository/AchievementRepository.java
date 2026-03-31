package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lockin.model.Achievement;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
}
