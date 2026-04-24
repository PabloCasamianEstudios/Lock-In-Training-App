package com.lockin.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CompetitiveScheduler {

    @Autowired
    private CompetitiveService competitiveService;

    /**
     * Se ejecuta el primer día del mes a las 00:00
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
     * Se ejecuta cada 6 meses
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
