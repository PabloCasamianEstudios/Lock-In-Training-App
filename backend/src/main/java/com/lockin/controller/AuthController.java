package com.lockin.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.lockin.model.dtos.*;
import com.lockin.model.User;
import com.lockin.service.UserService;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping({"/api/auth", "/api/auth2"})
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        try {
            User registeredUser = userService.registerNewUser(registrationDTO);
            return ResponseEntity.ok("User registered. ID: " + registeredUser.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            java.util.Map<String, Object> responseData = userService.authenticate(loginRequest);
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Authentication failure: " + e.getMessage());
        }
    }
}