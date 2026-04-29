package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "exercises")
@NoArgsConstructor
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String type;
    private String difficulty;

    private int baseReps;
    private int baseDuration;
    private double baseWeight;

    @ManyToOne
    @JoinColumn(name = "stat_impact_id")
    private Stat statImpact;
}
