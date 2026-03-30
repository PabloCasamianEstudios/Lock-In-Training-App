package com.lockin.model.dtos;
import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}