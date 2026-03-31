package com.lockin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.Quest;

public interface QuestRepository extends JpaRepository<Quest, Long> {
    List<Quest> findByType(Quest.QuestType type);
}

