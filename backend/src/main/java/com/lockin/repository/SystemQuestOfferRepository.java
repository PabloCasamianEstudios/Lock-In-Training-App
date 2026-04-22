package com.lockin.repository;

import com.lockin.model.SystemQuestOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemQuestOfferRepository extends JpaRepository<SystemQuestOffer, Long> {
    List<SystemQuestOffer> findByUserId(Long userId);
    void deleteByUserId(Long userId);
    void deleteByQuestId(Long questId);
}
