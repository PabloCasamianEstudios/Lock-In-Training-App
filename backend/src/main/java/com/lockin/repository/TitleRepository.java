package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lockin.model.Title;

public interface TitleRepository extends JpaRepository<Title, Long> {
}
