package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lockin.model.QuestStep;

public interface QuestStepRepository extends JpaRepository<QuestStep, Long> {
}
