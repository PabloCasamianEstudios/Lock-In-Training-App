package com.lockin.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Automation component for Lock-In Competitive Cycles
 */
@Component
public class CompetitiveScheduler {

    @Autowired
    private CompetitiveService competitiveService;

    /**
     * Executes every 1st of the month at 00:00.
     * Handles league promotions, demotions, and group shuffling.
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void scheduleMonthlyRotation() {
        System.out.println("LOG [SCHEDULER]: Starting monthly league rotation and shuffling...");
        try {
            competitiveService.processMonthlyLeagueUpdate();
            System.out.println("LOG [SCHEDULER]: Monthly rotation completed successfully.");
        } catch (Exception e) {
            System.err.println("LOG [EXC]: Error during monthly rotation: " + e.getMessage());
        }
    }

    /**
     * Executes every 6 months (Jan 1 and July 1) at 00:00.
     * Handles the hard reset of levels, stats, and seasonal prestige points.
     */
    @Scheduled(cron = "0 0 0 1 1,7 *")
    public void scheduleSeasonalHardReset() {
        System.out.println("LOG [SCHEDULER]: Starting 6-month seasonal cycle hard reset...");
        try {
            competitiveService.processSeasonCycleEnd();
            System.out.println("LOG [SCHEDULER]: Seasonal hard reset completed successfully.");
        } catch (Exception e) {
            System.err.println("LOG [EXC]: Error during seasonal reset: " + e.getMessage());
        }
    }
}
