package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

/* --- MODEL ZONE --- */
@Data
@Entity
@Table(name = "quest_steps")
@NoArgsConstructor
public class QuestStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quest_id", nullable = false)
    @JsonBackReference
    private Quest quest;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    private String description;
    private int series;
    private int repetitions;
}
