package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lockin.model.Exercise;
import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findByNameIgnoreCase(String name);
}
