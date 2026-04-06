package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "adventure_sessions")
@NoArgsConstructor
public class AdventureSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int hp;
    private int maxHp;

    private boolean isActive;

    @Column(columnDefinition = "TEXT")
    private String contextHistory;

    @Column(columnDefinition = "TEXT")
    private String lastOptions;

    private Long pendingQuestId;
    
    private String lastImagePrompt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void setLastUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
