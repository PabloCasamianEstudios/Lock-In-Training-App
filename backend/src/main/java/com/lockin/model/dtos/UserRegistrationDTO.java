package com.lockin.model.dtos;

import lombok.Data;

@Data
public class UserRegistrationDTO {
    private String email;
    private String password;
    private String username;
}