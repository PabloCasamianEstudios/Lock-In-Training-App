package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/* --- MODEL ZONE --- */
@Data
@Entity
@Table(name = "friendships")
@NoArgsConstructor
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Enumerated(EnumType.STRING)
    private FriendshipStatus status = FriendshipStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum FriendshipStatus {
        PENDING, ACCEPTED, REJECTED
    }
}
