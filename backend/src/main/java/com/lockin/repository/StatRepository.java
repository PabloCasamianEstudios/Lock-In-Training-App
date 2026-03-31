package com.lockin.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.Stat;

public interface StatRepository extends JpaRepository<Stat, Long> {
    Optional<Stat> findByName(String name);
}

