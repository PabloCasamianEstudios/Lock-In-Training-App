package com.lockin.controller;

import com.lockin.model.User;
import com.lockin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/moderation")
public class AdminModeratorController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/muted")
    public List<User> getMutedUsers() {
        return userRepository.findAll().stream()
                .filter(u -> "MUTE".equals(u.getRole()))
                .collect(Collectors.toList());
    }

    @PostMapping("/unmute/{userId}")
    public ResponseEntity<Object> unmuteUser(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    user.setRole("USER");
                    userRepository.save(user);
                    return ResponseEntity.ok((Object) "Usuario desmuteado con éxito");
                })
                .orElse(ResponseEntity.status(404).body("Usuario no encontrado"));
    }

    @PostMapping("/mute/{userId}")
    public ResponseEntity<Object> manualMute(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    user.setRole("MUTE");
                    userRepository.save(user);
                    return ResponseEntity.ok((Object) "Usuario muteado manualmente");
                })
                .orElse(ResponseEntity.status(404).body("Usuario no encontrado"));
    }
}
