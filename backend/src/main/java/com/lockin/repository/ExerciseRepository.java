package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lockin.model.Exercise;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
}
