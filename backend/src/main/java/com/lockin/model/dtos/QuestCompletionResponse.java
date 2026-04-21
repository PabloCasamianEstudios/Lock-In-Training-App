package com.lockin.model.dtos;

import com.lockin.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestCompletionResponse {
    private User user;
    private long xpReward;
    private long goldReward;
    private int levelsGained;
    private int statPointsGained;
}
