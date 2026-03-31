package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "leagues")
@NoArgsConstructor
public class League {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private int rankLevel;


    @Column(name = "league_rank",nullable = false)
    private String rank;

    private long reward;
    private long xpReward; 

    private long userCount = 0;
}

