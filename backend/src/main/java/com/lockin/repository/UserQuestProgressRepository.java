package com.lockin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.UserQuestProgress;

/* --- REPOSITORY ZONE --- */
public interface UserQuestProgressRepository extends JpaRepository<UserQuestProgress, Long> {
    List<UserQuestProgress> findByUserId(Long userId);
    List<UserQuestProgress> findByUserIdAndQuestId(Long userId, Long questId);
    
    @org.springframework.data.jpa.repository.Query("SELECT uqp FROM UserQuestProgress uqp WHERE uqp.user.id = :userId AND uqp.quest.type = :type")
    List<UserQuestProgress> findByUserIdAndQuestType(Long userId, com.lockin.model.Quest.QuestType type);

    List<UserQuestProgress> findByUserIdAndStatus(Long userId, com.lockin.model.UserQuestProgress.QuestStatus status);
}

