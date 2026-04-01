package com.lockin.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.lockin.model.UserTitle;

/* --- REPOSITORY ZONE --- */
public interface UserTitleRepository extends JpaRepository<UserTitle, Long> {
    Optional<UserTitle> findByUserIdAndIsEquippedTrue(Long userId);
}
