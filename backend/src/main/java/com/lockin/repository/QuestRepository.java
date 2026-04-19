package com.lockin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.Quest;

public interface QuestRepository extends JpaRepository<Quest, Long> {
    List<Quest> findByType(Quest.QuestType type);
    
    List<Quest> findByCreatorIdAndType(Long creatorId, Quest.QuestType type);

    @org.springframework.data.jpa.repository.Query("SELECT q FROM Quest q WHERE q.type = :type AND (q.creatorId = 0 OR q.creatorId = :userId)")
    List<Quest> findAllForUser(Long userId, Quest.QuestType type);
}

