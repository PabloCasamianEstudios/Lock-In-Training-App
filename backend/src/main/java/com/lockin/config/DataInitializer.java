package com.lockin.config;

import com.lockin.model.User;
import com.lockin.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "a@admin.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setRole("ADMIN");

                // Valores por defecto adicionales para evitar nulos si es necesario
                admin.setRank("S");
                admin.setLevel(100);

                userRepository.save(admin);
                System.out.println(">>> Usuario administrador creado por defecto: " + adminEmail);
            } else {
                userRepository.findByEmail(adminEmail).ifPresent(u -> {
                    if (!"ADMIN".equals(u.getRole())) {
                        u.setRole("ADMIN");
                        userRepository.save(u);
                        System.out.println(">>> Rol ADMIN restaurado para el administrador existente.");
                    }
                });
            }
        };
    }
}
