package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lockin.model.User;
import java.util.Optional;
import java.util.List;

/* --- REPOSITORY ZONE --- */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    List<User> findTop10ByOrderBySeasonPointsDesc();
    List<User> findAllByOrderBySeasonPointsDesc();
}