package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
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
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    private int hp;
    private int maxHp;

    private boolean isActive;

    @Column(columnDefinition = "TEXT")
    private String contextHistory;

    @Column(columnDefinition = "TEXT")
    private String lastOptions;

    private Long pendingQuestId;
    
    private int roomCount = 0;

    private String currentRoomType;

    @Column(columnDefinition = "TEXT")
    private String pastRooms;

    private String lastImagePrompt;

    @Column(columnDefinition = "TEXT")
    private String recommendedStats;

    private String currentLeague;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void setLastUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
