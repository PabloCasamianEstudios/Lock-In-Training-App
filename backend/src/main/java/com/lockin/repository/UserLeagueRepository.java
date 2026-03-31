package com.lockin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.User;
import com.lockin.model.UserLeague;

public interface UserLeagueRepository extends JpaRepository<UserLeague, Long> {
    List<UserLeague> findByUser(User user);
}

