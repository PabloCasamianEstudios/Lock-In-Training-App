package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}