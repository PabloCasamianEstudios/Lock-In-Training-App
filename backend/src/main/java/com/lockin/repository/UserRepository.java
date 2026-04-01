package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lockin.model.User;
import java.util.Optional;
import java.util.List;

/* --- REPOSITORY ZONE --- */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findTop10ByOrderBySeasonPointsDesc();
}