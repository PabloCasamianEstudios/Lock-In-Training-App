package com.lockin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.UserQuestProgress;

public interface UserQuestProgressRepository extends JpaRepository<UserQuestProgress, Long> {
    List<UserQuestProgress> findByUserId(Long userId);
}

