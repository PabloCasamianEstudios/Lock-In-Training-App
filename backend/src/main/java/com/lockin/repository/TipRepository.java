package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lockin.model.Tip;

public interface TipRepository extends JpaRepository<Tip, Long> {
}
