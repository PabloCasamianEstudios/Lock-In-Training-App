package com.lockin.service;

import com.lockin.model.dtos.LoginRequest;
import com.lockin.model.dtos.UserRegistrationDTO;
import com.lockin.config.JwtUtils;
import com.lockin.model.User;
import com.lockin.model.Stat;
import com.lockin.model.UserStat;
import com.lockin.repository.UserRepository;
import com.lockin.repository.StatRepository;
import com.lockin.repository.UserStatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final StatRepository statRepository;
    private final UserStatRepository userStatRepository;

    @Autowired
    public UserService(UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            StatRepository statRepository,
            UserStatRepository userStatRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.statRepository = statRepository;
        this.userStatRepository = userStatRepository;
    }

    public User registerNewUser(UserRegistrationDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());

        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        User savedUser = userRepository.save(user);

        List<Stat> allStats = statRepository.findAll();
        for (Stat stat : allStats) {
            UserStat userStat = new UserStat();
            userStat.setUser(savedUser);
            userStat.setStat(stat);
            userStat.setCurrentValue(0);
            userStatRepository.save(userStat);
        }

        return savedUser;
    }

    public java.util.Map<String, Object> authenticate(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            LocalDate today = LocalDate.now();
            if (user.getLastLoginDate() == null) {
                user.setStreak(1);
                user.setLastLoginDate(today);
                userRepository.save(user);
            } else if (!user.getLastLoginDate().equals(today)) {
                if (user.getLastLoginDate().plusDays(1).equals(today)) {
                    user.setStreak(user.getStreak() + 1);
                } else {
                    user.setStreak(1);
                }
                user.setLastLoginDate(today);
                userRepository.save(user);
            }

            String token = jwtUtils.generateJwtToken(user.getEmail(), user.getRole());

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("id", user.getId());

            return response;
        } else {
            throw new RuntimeException("Contraseña incorrecta");
        }
    }
}