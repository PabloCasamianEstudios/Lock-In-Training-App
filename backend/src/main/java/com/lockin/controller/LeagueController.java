package com.lockin.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lockin.service.LeagueGenerationService;

@RestController
@RequestMapping("/api/leagues")
public class LeagueController {

    private final LeagueGenerationService leagueGenerationService;

    public LeagueController(LeagueGenerationService leagueGenerationService) {
        this.leagueGenerationService = leagueGenerationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateLeagues(
            @RequestParam(defaultValue = "5") int maxUsersPerLeague) {
        Map<String, Object> result = leagueGenerationService.generateLeaguesByRank(maxUsersPerLeague);
        return ResponseEntity.ok(result);
    }

}
