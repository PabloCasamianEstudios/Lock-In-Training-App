package com.lockin.service;

import com.lockin.model.*;
import com.lockin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CompetitiveService {

    @Autowired private UserRepository userRepository;
    @Autowired private UserLeagueRepository userLeagueRepository;
    @Autowired private LeagueRepository leagueRepository;
    @Autowired private UserStatRepository userStatRepository;

    /* --- SEASON FORMULA ZONE --- */
    public long calculateSeasonPoints(User user) {
        // Points = (LeagueLevel * 5000) + (StatsTotal * 10) + (UserLevel * 100)
        int leagueLvl = 1;
        List<UserLeague> leagues = userLeagueRepository.findByUser(user);
        if (!leagues.isEmpty()) {
            leagueLvl = leagues.get(0).getLeague().getRankLevel();
        }

        long statsTotal = userStatRepository.findByUser(user).stream()
                .mapToLong(UserStat::getCurrentValue)
                .sum();

        return (leagueLvl * 5000L) + (statsTotal * 10L) + (user.getLevel() * 100L);
    }

    /* --- MONTHLY ROTATION ZONE --- */
    @Transactional
    public void processMonthlyLeagueUpdate() {
        List<UserLeague> allUserLeagues = userLeagueRepository.findAll();
        
        // Group by League AND GroupId
        Map<String, List<UserLeague>> groups = allUserLeagues.stream()
                .collect(Collectors.groupingBy(ul -> ul.getLeague().getId() + "-" + ul.getGroupId()));

        for (List<UserLeague> groupMembers : groups.values()) {
            // Sort by user's total points (current month's performance)
            groupMembers.sort((a, b) -> Long.compare(b.getUser().getTotalPoints(), a.getUser().getTotalPoints()));

            int size = groupMembers.size();
            for (int i = 0; i < size; i++) {
                UserLeague ul = groupMembers.get(i);
                int currentLvl = ul.getLeague().getRankLevel();

                // Promotion (Top 4 of 20 = 20%)
                if (i < 4 && currentLvl < 6) {
                    promote(ul, currentLvl + 1);
                } 
                // Demotion (Bottom 4 of 20 = 20%)
                else if (i >= size - 4 && currentLvl > 1) {
                    demote(ul, currentLvl - 1);
                }
            }
        }
    }

    private void promote(UserLeague ul, int nextLvl) {
        leagueRepository.findByRankLevel(nextLvl).ifPresent(l -> {
            ul.setLeague(l);
            ul.getUser().setRank(l.getRank());
            userLeagueRepository.save(ul);
        });
    }

    private void demote(UserLeague ul, int prevLvl) {
        leagueRepository.findByRankLevel(prevLvl).ifPresent(l -> {
            ul.setLeague(l);
            ul.getUser().setRank(l.getRank());
            userLeagueRepository.save(ul);
        });
    }

    /* --- SEASON RESET ZONE --- */
    @Transactional
    public void processSeasonCycleEnd() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            // 1. Reduce current Season Points by 75% (Keeping only 25% for prestige)
            user.setSeasonPoints((long) (user.getSeasonPoints() * 0.25));

            // 3. True Stats Reset
            user.setLevel(1);
            user.setXp(0);
            user.setTotalPoints(0);
            
            List<UserStat> stats = userStatRepository.findByUser(user);
            for (UserStat us : stats) {
                us.setCurrentValue(1);
                userStatRepository.save(us);
            }

            userRepository.save(user);
        }
        
        // 4. Update Global Prestige Ranks (S to E)
        refreshGlobalPrestigeRanks();
    }

    @Transactional
    public void refreshGlobalPrestigeRanks() {
        List<User> allUsers = userRepository.findAll();
        allUsers.sort((a, b) -> Long.compare(b.getSeasonPoints(), a.getSeasonPoints()));

        for (int i = 0; i < allUsers.size(); i++) {
            User u = allUsers.get(i);
            String rank = "E";
            if (i < 10) rank = "S";
            else if (i < 210) rank = "A";
            else if (i < 610) rank = "B";
            else if (i < 1410) rank = "C";
            else if (i < 3410) rank = "D";
            
            u.setSeasonRank(rank);
            userRepository.save(u);
        }
    }
}
