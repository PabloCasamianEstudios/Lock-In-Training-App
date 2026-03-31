package com.lockin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lockin.model.User;
import com.lockin.model.dtos.UserSurveyDTO;
import com.lockin.repository.UserRepository;
import com.lockin.service.UserSurveyService;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserSurveyService userSurveyService;
    private final UserRepository userRepository;

    public UserController(UserSurveyService userSurveyService,
                          UserRepository userRepository) {
        this.userSurveyService = userSurveyService;
        this.userRepository = userRepository;
    }

    @PostMapping("/survey")
    public ResponseEntity<User> submitSurvey(@RequestBody UserSurveyDTO dto) {
        User updated = userSurveyService.processSurvey(dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

