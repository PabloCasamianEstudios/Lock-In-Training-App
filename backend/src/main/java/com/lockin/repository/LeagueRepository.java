package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.League;

public interface LeagueRepository extends JpaRepository<League, Long> {
}

