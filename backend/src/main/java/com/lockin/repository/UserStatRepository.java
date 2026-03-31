package com.lockin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lockin.model.User;
import com.lockin.model.UserStat;

public interface UserStatRepository extends JpaRepository<UserStat, Long> {
    List<UserStat> findByUser(User user);
}

