package com.lockin.repository;

import com.lockin.model.AdventureSession;
import com.lockin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdventureSessionRepository extends JpaRepository<AdventureSession, Long> {
    Optional<AdventureSession> findByUserAndIsActiveTrue(User user);
}
