package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Boolean existsByEmail(String email);
}