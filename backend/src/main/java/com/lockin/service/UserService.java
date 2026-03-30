package com.lockin.service;

import com.lockin.model.dtos.LoginRequest;
import com.lockin.model.dtos.UserRegistrationDTO;
import com.lockin.config.JwtUtils;
import com.lockin.model.User;
import com.lockin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Autowired
    public UserService(UserRepository userRepository, 
                       BCryptPasswordEncoder passwordEncoder, 
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public User registerNewUser(UserRegistrationDTO dto) {
        if(userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El email ya está registrado.");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());
        
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        return userRepository.save(user);
    }

    public String authenticate(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return jwtUtils.generateJwtToken(user.getEmail());
        } else {
            throw new RuntimeException("Contraseña incorrecta");
        }
    }
}