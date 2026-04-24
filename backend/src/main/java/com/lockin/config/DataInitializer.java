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
        // USUARIO ADMIN PARA ENTRAR (DEBUG Y OFFLINE QUE SE CLONEN EL REPO, NO LO
        // BORRES MAGALLÓN)
        return args -> {
            String adminEmail = "a@admin.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setRole("ADMIN");
                admin.setRank("S");

                userRepository.save(admin);
                System.out.println(">>> Usuario administrador autogenerado: " + adminEmail);
            }
        };
    }
}
