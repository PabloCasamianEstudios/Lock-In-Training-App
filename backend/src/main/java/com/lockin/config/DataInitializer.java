package com.lockin.config;

import com.lockin.model.User;
import com.lockin.model.Stat;
import com.lockin.model.UserStat;
import com.lockin.repository.UserRepository;
import com.lockin.repository.StatRepository;
import com.lockin.repository.UserStatRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, StatRepository statRepository, UserStatRepository userStatRepository) {
        return args -> {
            // 1. Inicializar Estadísticas base
            List<String> baseStats = Arrays.asList("STR", "AGI", "VIT", "INT", "LUK", "SPD", "DISC");
            for (String statName : baseStats) {
                if (statRepository.findByName(statName).isEmpty()) {
                    Stat s = new Stat();
                    s.setName(statName);
                    s.setDescription("Estadística de " + statName);
                    statRepository.save(s);
                }
            }

            // 2. Usuario administrador
            String adminEmail = "a@admin.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setRole("ADMIN");
                admin.setRank("S");

                User savedAdmin = userRepository.save(admin);
                
                List<Stat> allStats = statRepository.findAll();
                for (Stat stat : allStats) {
                    UserStat userStat = new UserStat();
                    userStat.setUser(savedAdmin);
                    userStat.setStat(stat);
                    userStat.setCurrentValue(10);
                    userStatRepository.save(userStat);
                }
                
                System.out.println(">>> Usuario administrador autogenerado: " + adminEmail);
            }
        };
    }
}
