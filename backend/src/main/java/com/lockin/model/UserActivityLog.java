package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_activity_logs")
@NoArgsConstructor
public class UserActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private ActivityType type;

    private double amount;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String metadata; // For storing reasons or quest IDs

    public enum ActivityType {
        XP_GAIN, LEVEL_UP, STAT_GAIN, QUEST_COMPLETED
    }
}
