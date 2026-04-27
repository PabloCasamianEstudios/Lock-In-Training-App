package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_quest_progress")
@NoArgsConstructor
public class UserQuestProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "quest_id", nullable = false)
    private Quest quest;

    @Enumerated(EnumType.STRING)
    private QuestStatus status = QuestStatus.ACTIVE;

    private Long appliedXpReward;
    private Long appliedGoldReward;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isMandatoryDaily = false;

    private LocalDateTime startTime = LocalDateTime.now();
    private LocalDateTime completionTime;

    public enum QuestStatus {
        ACTIVE, COMPLETED, FAILED
    }
}
