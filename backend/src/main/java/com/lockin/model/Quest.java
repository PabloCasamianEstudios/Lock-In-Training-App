package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "quests")
@NoArgsConstructor
public class Quest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private QuestType type;

    private String rankDifficulty; // E, D, C, B, A, S, SS, SS+

    private long goldReward;
    private long xpReward;

    public enum QuestType {
        DAILY, STORY, SIDE, CUSTOM
    }
}
