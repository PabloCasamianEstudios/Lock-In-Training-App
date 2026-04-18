package com.lockin.model.dtos;

import lombok.Data;
import java.util.List;

@Data
public class CreateQuestDTO {
    private String title;
    private List<CreateQuestExerciseDTO> exercises;

    @Data
    public static class CreateQuestExerciseDTO {
        private String name;
        private Integer reps;
        private Integer seconds;
    }
}
