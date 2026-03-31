package com.lockin.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lockin.model.League;
import com.lockin.model.User;
import com.lockin.model.UserLeague;
import com.lockin.repository.LeagueRepository;
import com.lockin.repository.UserLeagueRepository;
import com.lockin.repository.UserRepository;

@Service
public class LeagueGenerationService {

    private final UserRepository userRepository;
    private final LeagueRepository leagueRepository;
    private final UserLeagueRepository userLeagueRepository;

    public LeagueGenerationService(UserRepository userRepository,
                                   LeagueRepository leagueRepository,
                                   UserLeagueRepository userLeagueRepository) {
        this.userRepository = userRepository;
        this.leagueRepository = leagueRepository;
        this.userLeagueRepository = userLeagueRepository;
    }

    @Transactional
    public Map<String, Object> generateLeaguesByRank(int maxUsersPerLeague) {
        int safeMaxUsersPerLeague = Math.max(1, maxUsersPerLeague);

        // Regeneración completa: limpiamos ligas/asignaciones previas.
        userLeagueRepository.deleteAllInBatch();
        leagueRepository.deleteAllInBatch();

        List<User> users = userRepository.findAll();

        // Agrupar por rango (si falta rango, se asigna E por defecto).
        Map<String, List<User>> usersByRank = users.stream()
                .collect(Collectors.groupingBy(user -> normalizeRank(user.getRank())));

        List<String> orderedRanks = new ArrayList<>(usersByRank.keySet());
        orderedRanks.sort(Comparator.comparingInt(this::rankOrder));

        int totalLeaguesCreated = 0;
        int totalAssignments = 0;
        List<Map<String, Object>> leaguesSummary = new ArrayList<>();

        for (String rank : orderedRanks) {
            List<User> rankUsers = usersByRank.get(rank);

            for (int i = 0; i < rankUsers.size(); i += safeMaxUsersPerLeague) {
                List<User> chunk = rankUsers.subList(i, Math.min(i + safeMaxUsersPerLeague, rankUsers.size()));

                League league = new League();
                league.setRank(rank);
                league.setRankLevel(rankOrder(rank));
                league.setUserCount(chunk.size());
                league.setReward(defaultRewardByRank(rank));
                league.setXpReward(defaultXpRewardByRank(rank));
                League savedLeague = leagueRepository.save(league);

                for (User user : chunk) {
                    UserLeague assignment = new UserLeague();
                    assignment.setUser(user);
                    assignment.setLeague(savedLeague);
                    userLeagueRepository.save(assignment);
                    totalAssignments++;
                }

                totalLeaguesCreated++;

                Map<String, Object> leagueData = new HashMap<>();
                leagueData.put("leagueId", savedLeague.getId());
                leagueData.put("rank", rank);
                leagueData.put("users", chunk.stream().map(User::getId).toList());
                leagueData.put("size", chunk.size());
                leaguesSummary.add(leagueData);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", users.size());
        response.put("maxUsersPerLeague", safeMaxUsersPerLeague);
        response.put("totalLeaguesCreated", totalLeaguesCreated);
        response.put("totalAssignments", totalAssignments);
        response.put("leagues", leaguesSummary);
        return response;
    }

    private String normalizeRank(String rank) {
        if (rank == null || rank.isBlank()) {
            return "E";
        }
        return rank.trim().toUpperCase();
    }

    private int rankOrder(String rank) {
        return switch (normalizeRank(rank)) {
            case "E" -> 1;
            case "D" -> 2;
            case "C" -> 3;
            case "B" -> 4;
            case "A" -> 5;
            case "S" -> 6;
            case "SS" -> 7;
            default -> 99;
        };
    }

    private long defaultRewardByRank(String rank) {
        return switch (normalizeRank(rank)) {
            case "E" -> 100;
            case "D" -> 250;
            case "C" -> 500;
            case "B" -> 1000;
            case "A" -> 2000;
            case "S" -> 5000;
            case "SS" -> 10000;
            default -> 100;
        };
    }

    private long defaultXpRewardByRank(String rank) {
        return switch (normalizeRank(rank)) {
            case "E" -> 50;
            case "D" -> 100;
            case "C" -> 200;
            case "B" -> 400;
            case "A" -> 800;
            case "S" -> 1500;
            case "SS" -> 3000;
            default -> 50;
        };
    }
}

