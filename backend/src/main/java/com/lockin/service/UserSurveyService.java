package com.lockin.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lockin.model.Stat;
import com.lockin.model.User;
import com.lockin.model.UserStat;
import com.lockin.model.dtos.UserSurveyDTO;
import com.lockin.repository.StatRepository;
import com.lockin.repository.UserRepository;
import com.lockin.repository.UserStatRepository;

@Service
public class UserSurveyService {

    private final UserRepository userRepository;
    private final StatRepository statRepository;
    private final UserStatRepository userStatRepository;
    private final Random random = new Random();

    public UserSurveyService(UserRepository userRepository,
            StatRepository statRepository,
            UserStatRepository userStatRepository) {
        this.userRepository = userRepository;
        this.statRepository = statRepository;
        this.userStatRepository = userStatRepository;
    }

    @Transactional
    public User processSurvey(UserSurveyDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setWeight(dto.getWeight());
        user.setHeight(dto.getHeight());

        Map<String, Integer> statValues = calculateStats(dto);

        persistUserStats(user, statValues);

        int total = statValues.values().stream().mapToInt(Integer::intValue).sum();
        String rank = calculateRank(total);
        user.setLevel(1);
        user.setTotalPoints(total);
        user.setRank(rank);

        return userRepository.save(user);
    }

    private Map<String, Integer> calculateStats(UserSurveyDTO dto) {
        Map<String, Integer> values = new HashMap<>();

        // STR
        int str = 10;
        if (dto.getPushUps() > 30) {
            str += 10;
        }
        if ("STR".equalsIgnoreCase(dto.getGoal())) {
            str += 5;
        }
        values.put("STR", str);

        // AGI
        int agi = 10;
        if (dto.getRunTime() > 20) {
            agi += 10;
        }
        if ("AGI".equalsIgnoreCase(dto.getGoal())) {
            agi += 5;
        }
        values.put("AGI", agi);

        // VIT (BMI)
        double heightMeters = dto.getHeight() > 0 ? dto.getHeight() / 100.0 : 0;
        double bmi = (heightMeters > 0) ? dto.getWeight() / (heightMeters * heightMeters) : 0;
        int vit = 10;
        if (bmi >= 18.5 && bmi <= 25) {
            vit += 10;
        }
        values.put("VIT", vit);

        // DISC
        int disc = 0;
        if ("Diario".equalsIgnoreCase(dto.getFrequency())) {
            disc = 10;
        }
        values.put("DISC", disc);

        // LUK
        int luk = 1 + random.nextInt(10);
        values.put("LUK", luk);

        return values;
    }

    private void persistUserStats(User user, Map<String, Integer> statValues) {
        List<UserStat> existing = userStatRepository.findByUser(user);
        Map<String, UserStat> byName = new HashMap<>();

        for (UserStat us : existing) {
            byName.put(us.getStat().getName(), us);
        }

        for (Map.Entry<String, Integer> entry : statValues.entrySet()) {
            String statName = entry.getKey();
            int value = entry.getValue();

            Stat stat = statRepository.findByName(statName)
                    .orElseThrow(() -> new RuntimeException("Stat no encontrada: " + statName));

            UserStat userStat = byName.get(statName);
            if (userStat == null) {
                userStat = new UserStat();
                userStat.setUser(user);
                userStat.setStat(stat);
            }
            userStat.setCurrentValue(value);
            userStatRepository.save(userStat);
        }
    }

    private String calculateRank(int totalStats) {
        if (totalStats < 40) {
            return "E";
        } else if (totalStats <= 70) {
            return "D";
        } else {
            return "C";
        }
    }
}
