package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

/* --- MODEL ZONE --- */
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

    private String rankDifficulty;

    private long goldReward;
    private long xpReward;

    @Column(nullable = false, columnDefinition = "bigint default 0")
    private Long creatorId = 0L; // 0 = System/Global

    @OneToMany(mappedBy = "quest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<QuestStep> steps = new java.util.ArrayList<>();

    public void addStep(QuestStep step) {
        steps.add(step);
        step.setQuest(this);
    }

    public enum QuestType {
        DAILY, STORY, CUSTOM, SYSTEM
    }
}
