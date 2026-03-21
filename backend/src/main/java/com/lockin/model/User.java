package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String profilePic;
    
    private LocalDateTime registrationDate = LocalDateTime.now();

    // Progresión RPG
    private int streak = 0;
    private long totalPoints = 0;
    private int level = 1;
    private long xp = 0;
    private long coins = 0;
    private String role = "USER";

    // Biometría
    private Double weight; // kg
    private Double height; // cm
    private LocalDate birthDate;
    private String gender;

    // Estado Físico
    private int energy = 100;
    private int fatigue = 0;
    private int completedWorkouts = 0;
    private double totalTrainingTime = 0.0;
    private int achievedChallenges = 0;

    @Transient
    private Double imc;

    @PostLoad
    @PostPersist
    @PostUpdate
    public void calculateIMC() {
        if (weight != null && height != null && height > 0) {
            double heightInMeters = height / 100.0;
            this.imc = weight / (heightInMeters * heightInMeters);
        }
    }

    // Relaciones (Simplificadas por ahora)
    // private Long leagueId; 
}
