package com.lockin.model.dtos;

import lombok.Data;

@Data
public class UserSurveyDTO {
    private Long userId;
    private int pushUps;        // número de flexiones máximas
    private int runTime;        // tiempo de carrera en minutos
    private String goal;        // 'STR', 'AGI', etc.
    private String frequency;   // por ejemplo: 'Diario', 'Semanal', etc.
    private double weight;      // kg
    private double height;      // cm
}

