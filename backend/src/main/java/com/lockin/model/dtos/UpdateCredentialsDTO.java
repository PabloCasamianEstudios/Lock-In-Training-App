package com.lockin.model.dtos;

import lombok.Data;

@Data
public class UpdateCredentialsDTO {
    private String username;
    private String email;
    private String password;
}
