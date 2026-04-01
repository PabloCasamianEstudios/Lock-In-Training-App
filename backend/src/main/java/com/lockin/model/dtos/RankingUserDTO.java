package com.lockin.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/* --- DTO ZONE --- */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingUserDTO {
    private Long id;
    private String username;
    private String profilePic;
    private String title;
    private int level;
    private String rank;
    private long totalPoints;
}
