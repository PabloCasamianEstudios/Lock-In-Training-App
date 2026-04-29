package com.lockin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lockin.model.User;
import com.lockin.model.UserQuestProgress;
import com.lockin.model.QuestStep;
import com.lockin.model.dtos.UserSurveyDTO;
import com.lockin.repository.UserRepository;
import com.lockin.repository.UserQuestProgressRepository;
import com.lockin.repository.UserItemRepository;
import com.lockin.repository.UserTitleRepository;
import com.lockin.model.UserItem;
import com.lockin.model.UserTitle;
import com.lockin.model.UserLeague;
import com.lockin.model.dtos.RankingUserDTO;
import com.lockin.repository.UserLeagueRepository;
import com.lockin.repository.StatRepository;
import com.lockin.service.UserSurveyService;
import com.lockin.service.UserService;
import com.lockin.model.dtos.UpdateCredentialsDTO;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.Collections;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserSurveyService userSurveyService;
    private final UserRepository userRepository;
    private final UserQuestProgressRepository userQuestProgressRepository;
    private final com.lockin.repository.QuestRepository questRepository;
    private final com.lockin.repository.UserStatRepository userStatRepository;
    private final UserItemRepository userItemRepository;
    private final UserTitleRepository userTitleRepository;
    private final UserLeagueRepository userLeagueRepository;
    private final StatRepository statRepository;
    private final com.lockin.repository.AchievementRepository achievementRepository;
    private final com.lockin.repository.UserAchievementRepository userAchievementRepository;
    private final com.lockin.service.SystemQuestService systemQuestService;
    private final UserService userService;

    public UserController(UserSurveyService userSurveyService,
            UserRepository userRepository,
            UserQuestProgressRepository userQuestProgressRepository,
            com.lockin.repository.QuestRepository questRepository,
            com.lockin.repository.UserStatRepository userStatRepository,
            UserItemRepository userItemRepository,
            UserTitleRepository userTitleRepository,
            UserLeagueRepository userLeagueRepository,
            StatRepository statRepository,
            com.lockin.repository.AchievementRepository achievementRepository,
            com.lockin.repository.UserAchievementRepository userAchievementRepository,
            com.lockin.service.SystemQuestService systemQuestService,
            UserService userService) {
        this.userSurveyService = userSurveyService;
        this.userRepository = userRepository;
        this.userQuestProgressRepository = userQuestProgressRepository;
        this.questRepository = questRepository;
        this.userStatRepository = userStatRepository;
        this.userItemRepository = userItemRepository;
        this.userTitleRepository = userTitleRepository;
        this.userLeagueRepository = userLeagueRepository;
        this.statRepository = statRepository;
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.systemQuestService = systemQuestService;
        this.userService = userService;
    }

    @PostMapping("/survey")
    public ResponseEntity<User> submitSurvey(@RequestBody UserSurveyDTO dto) {
        User updated = userSurveyService.processSurvey(dto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/credentials")
    public ResponseEntity<?> updateCredentials(@PathVariable Long id, @RequestBody UpdateCredentialsDTO dto) {
        try {
            User updated = userService.updateCredentials(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/quests")
    public ResponseEntity<List<Map<String, Object>>> getUserQuests(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<UserQuestProgress> quests = userQuestProgressRepository.findByUserId(id);

        // Devolvemos DTO plano para evitar recursión infinita de relaciones JPA.
        List<Map<String, Object>> response = new ArrayList<>();
        for (UserQuestProgress progress : quests) {
            Map<String, Object> progressData = new HashMap<>();
            boolean isCompleted = progress.getStatus() == UserQuestProgress.QuestStatus.COMPLETED;

            List<Map<String, Object>> exercises = new ArrayList<>();
            int totalRepetitions = 0;

            if (progress.getQuest().getSteps() != null) {
                for (QuestStep step : progress.getQuest().getSteps()) {
                    int stepTotalReps = step.getSeries() * step.getRepetitions();
                    totalRepetitions += stepTotalReps;

                    Map<String, Object> exerciseData = new HashMap<>();
                    exerciseData.put("exerciseId", step.getExercise() != null ? step.getExercise().getId() : null);
                    exerciseData.put("exerciseName", step.getExercise() != null ? step.getExercise().getName() : null);
                    exerciseData.put("exerciseType", step.getExercise() != null ? step.getExercise().getType() : null);
                    exerciseData.put("series", step.getSeries());
                    exerciseData.put("repetitionsPerSeries", step.getRepetitions());
                    exerciseData.put("totalRepetitions", stepTotalReps);
                    exerciseData.put("completedRepetitions", isCompleted ? stepTotalReps : 0);
                    exercises.add(exerciseData);
                }
            }

            int completedRepetitions = isCompleted ? totalRepetitions : 0;

            progressData.put("progressId", progress.getId());
            progressData.put("status", progress.getStatus() != null ? progress.getStatus().name() : null);
            progressData.put("completed", isCompleted);
            progressData.put("startTime", progress.getStartTime());
            progressData.put("completionTime", progress.getCompletionTime());

            progressData.put("questId", progress.getQuest().getId());
            progressData.put("title", progress.getQuest().getTitle());
            progressData.put("rank", progress.getQuest().getRankDifficulty());
            progressData.put("difficulty", progress.getQuest().getRankDifficulty());
            progressData.put("xpReward", progress.getQuest().getXpReward());
            progressData.put("goldReward", progress.getQuest().getGoldReward());
            progressData.put("totalRepetitions", totalRepetitions);
            progressData.put("completedRepetitions", completedRepetitions);
            progressData.put("exercises", exercises);

            response.add(progressData);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/quests/daily/today")
    public ResponseEntity<List<Map<String, Object>>> getDailyQuestsForToday(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // 1. Verificar si ya existe la diaria obligatoria de hoy
        List<UserQuestProgress> allProgress = userQuestProgressRepository.findByUserId(id);
        UserQuestProgress mandatoryProgress = allProgress.stream()
                .filter(p -> p.isMandatoryDaily() 
                        && p.getStartTime() != null 
                        && p.getStartTime().toLocalDate().equals(today))
                .findFirst()
                .orElse(null);

        if (mandatoryProgress == null) {
            // Generar nueva misión diaria obligatoria
            User user = userRepository.findById(id).orElse(null);
            String rank = (user != null && user.getSeasonRank() != null) ? user.getSeasonRank() : "E";
            
            List<com.lockin.model.Quest> pool = questRepository.findByType(com.lockin.model.Quest.QuestType.SYSTEM).stream()
                    .filter(q -> rank.equals(q.getRankDifficulty()))
                    .toList();
            
            if (!pool.isEmpty()) {
            mandatoryProgress = systemQuestService.generateMandatoryDaily(user);
            }
        }

        List<Map<String, Object>> response = new ArrayList<>();
        
        // Añadir la obligatoria si existe
        if (mandatoryProgress != null) {
            response.add(mapProgressToMap(mandatoryProgress, today));
        }

        // Muestras: otras quests diarias (opcional, el usuario pidió que se le asigne UNA, 
        // pero mantendré las otras 2 del pool para no romper la UI si espera 3)
        List<com.lockin.model.Quest> dailyPool = questRepository.findByType(com.lockin.model.Quest.QuestType.DAILY).stream()
                .filter(q -> q.getCreatorId() != null && q.getCreatorId() == 0L) // Solo globales
                .collect(Collectors.toList());
                
        java.util.Collections.shuffle(dailyPool, new java.util.Random(LocalDate.now().toEpochDay()));
        
        for (com.lockin.model.Quest quest : dailyPool) {
            if (response.size() >= 3) break;
            
            UserQuestProgress latest = userQuestProgressRepository.findByUserIdAndQuestId(id, quest.getId()).stream()
                    .filter(p -> p.getStartTime() != null && p.getStartTime().toLocalDate().equals(today))
                    .findFirst()
                    .orElse(null);

            if (latest == null) {
                latest = new UserQuestProgress();
                latest.setUser(userRepository.getReferenceById(id));
                latest.setQuest(quest);
                latest.setStatus(UserQuestProgress.QuestStatus.ACTIVE);
                latest.setStartTime(now);
                latest = userQuestProgressRepository.save(latest);
            }
            response.add(mapProgressToMap(latest, today));
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/daily-completed")
    public ResponseEntity<Boolean> isDailyCompleted(@PathVariable Long id) {
        LocalDate today = LocalDate.now();
        List<UserQuestProgress> progressList = userQuestProgressRepository.findByUserId(id);
        
        boolean completed = progressList.stream()
                .anyMatch(p -> p.isMandatoryDaily() 
                            && p.getStatus() == UserQuestProgress.QuestStatus.COMPLETED
                            && (
                                p.getCompletionTime() == null || // Flexibilidad para Workbench
                                p.getCompletionTime().toLocalDate().equals(today) ||
                                (p.getStartTime() != null && p.getStartTime().toLocalDate().equals(today))
                            ));
        
        return ResponseEntity.ok(completed);
    }

    private Map<String, Object> mapProgressToMap(UserQuestProgress latest, LocalDate today) {
        com.lockin.model.Quest quest = latest.getQuest();
        boolean isCompleted = latest.getStatus() == UserQuestProgress.QuestStatus.COMPLETED;
        boolean completedToday = isCompleted
                && latest.getCompletionTime() != null
                && latest.getCompletionTime().toLocalDate().equals(today);

        List<Map<String, Object>> exercises = new ArrayList<>();
        int totalRepetitions = 0;
        if (quest.getSteps() != null) {
            for (QuestStep step : quest.getSteps()) {
                int stepTotalReps = step.getSeries() * step.getRepetitions();
                totalRepetitions += stepTotalReps;
 
                Map<String, Object> stepData = new HashMap<>();
                Map<String, Object> exerciseInfo = new HashMap<>();
                
                if (step.getExercise() != null) {
                    exerciseInfo.put("id", step.getExercise().getId());
                    exerciseInfo.put("name", step.getExercise().getName());
                    exerciseInfo.put("type", step.getExercise().getType());
                }
                
                stepData.put("exercise", exerciseInfo);
                stepData.put("series", step.getSeries());
                stepData.put("repetitions", step.getRepetitions());
                stepData.put("totalRepetitions", stepTotalReps);
                stepData.put("completedRepetitions", completedToday ? stepTotalReps : 0);
                
                exercises.add(stepData);
            }
        }

        Map<String, Object> progressData = new HashMap<>();
        progressData.put("progressId", latest.getId());
        progressData.put("status", latest.getStatus() != null ? latest.getStatus().name() : null);
        progressData.put("completed", completedToday);
        progressData.put("startTime", latest.getStartTime());
        progressData.put("completionTime", latest.getCompletionTime());
        progressData.put("isMandatory", latest.isMandatoryDaily());

        progressData.put("questId", quest.getId());
        progressData.put("title", quest.getTitle());
        progressData.put("rank", quest.getRankDifficulty());
        progressData.put("difficulty", quest.getRankDifficulty());
        progressData.put("xpReward", quest.getXpReward());
        progressData.put("goldReward", quest.getGoldReward());

        progressData.put("totalRepetitions", totalRepetitions);
        progressData.put("completedRepetitions", completedToday ? totalRepetitions : 0);
        progressData.put("description", quest.getDescription()); // Asegurar que la descripción se envía
        progressData.put("steps", exercises);

        return progressData;
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<List<Map<String, Object>>> getUserStats(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        List<com.lockin.model.UserStat> stats = userStatRepository.findByUser(userRepository.getReferenceById(id));

        List<Map<String, Object>> response = new ArrayList<>();
        for (com.lockin.model.UserStat us : stats) {
            Map<String, Object> statData = new HashMap<>();
            statData.put("id", us.getId());
            statData.put("name", us.getStat().getName());
            statData.put("description", us.getStat().getDescription());
            statData.put("value", us.getCurrentValue());
            response.add(statData);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<Map<String, Object>>> getUserItems(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<UserItem> items = userItemRepository.findByUserId(id);
        List<Map<String, Object>> response = new ArrayList<>();
        for (UserItem ui : items) {
            Map<String, Object> data = new HashMap<>();
            data.put("id", ui.getId());
            data.put("itemId", ui.getItem().getId());
            data.put("name", ui.getItem().getName());
            data.put("description", ui.getItem().getDescription());
            data.put("type", ui.getItem().getType() != null ? ui.getItem().getType().name() : null);
            data.put("quantity", ui.getQuantity());
            response.add(data);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/titles")
    public ResponseEntity<List<Map<String, Object>>> getUserTitles(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<UserTitle> titles = userTitleRepository.findByUserId(id);
        List<Map<String, Object>> response = new ArrayList<>();
        for (UserTitle ut : titles) {
            Map<String, Object> data = new HashMap<>();
            data.put("id", ut.getId());
            data.put("titleId", ut.getTitle().getId());
            data.put("name", ut.getTitle().getName());
            data.put("description", ut.getTitle().getDescription());
            data.put("isEquipped", ut.isEquipped());
            response.add(data);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/achievements")
    public ResponseEntity<List<Map<String, Object>>> getUserAchievements(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<com.lockin.model.Achievement> allAchievements = achievementRepository.findAll();
        List<com.lockin.model.UserAchievement> userAchievements = userAchievementRepository.findByUser(user);
        
        List<Long> unlockedIds = userAchievements.stream()
                .map(ua -> ua.getAchievement().getId())
                .toList();

        List<Map<String, Object>> response = new ArrayList<>();
        for (com.lockin.model.Achievement ach : allAchievements) {
            Map<String, Object> data = new HashMap<>();
            data.put("id", ach.getId());
            data.put("title", ach.getTitle());
            data.put("description", ach.getDescription());
            data.put("iconUrl", ach.getIconUrl());
            data.put("completed", unlockedIds.contains(ach.getId()));
            response.add(data);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/equip-title/{titleId}")
    public ResponseEntity<Object> equipTitle(@PathVariable Long id, @PathVariable Long titleId) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        List<UserTitle> allUserTitles = userTitleRepository.findByUserId(id);
        UserTitle target = null;

        for (UserTitle ut : allUserTitles) {
            if (ut.getTitle().getId().equals(titleId)) {
                ut.setEquipped(true);
                target = ut;
            } else {
                ut.setEquipped(false);
            }
        }

        if (target == null) {
            return ResponseEntity.badRequest().body("No posees este título.");
        }

        userTitleRepository.saveAll(allUserTitles);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/league-players")
    public ResponseEntity<List<RankingUserDTO>> getLeaguePlayers(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<UserLeague> userLeagues = userLeagueRepository.findByUser(user);
        if (userLeagues.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        UserLeague ulContext = userLeagues.get(0);

        List<UserLeague> colleagues = userLeagueRepository.findByLeagueIdAndGroupId(
                ulContext.getLeague().getId(),
                ulContext.getGroupId());

        List<RankingUserDTO> ranking = colleagues.stream()
                .map(ul -> mapToRankingDTO(ul.getUser()))
                .sorted((a, b) -> Long.compare(b.getSeasonPoints(), a.getSeasonPoints()))
                .toList();

        return ResponseEntity.ok(ranking);
    }

    private RankingUserDTO mapToRankingDTO(User user) {
        String titleName = userTitleRepository.findByUserIdAndIsEquippedTrue(user.getId())
                .map(ut -> ut.getTitle().getName())
                .orElse("Sin título");

        return RankingUserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .profilePic(user.getProfilePic())
                .title(titleName)
                .level(user.getLevel())
                .rank(user.getRank())
                .seasonRank(user.getSeasonRank())
                .totalPoints(user.getTotalPoints())
                .seasonPoints(user.getSeasonPoints())
                .build();
    }

    @PostMapping("/{id}/distribute-stats")
    public ResponseEntity<Object> distributeStats(@PathVariable Long id,
            @RequestBody Map<String, Integer> distribution) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();

        int totalPointsToSpend = distribution.values().stream().mapToInt(Integer::intValue).sum();
        if (totalPointsToSpend > user.getStatPoints()) {
            return ResponseEntity.badRequest().body("No tienes suficientes puntos de estadísticas.");
        }

        if (distribution.containsKey("DISC")) {
            return ResponseEntity.badRequest().body("La disciplina no se puede subir con puntos de nivel.");
        }

        List<com.lockin.model.UserStat> currentStats = userStatRepository.findByUser(user);

        for (Map.Entry<String, Integer> entry : distribution.entrySet()) {
            String statName = entry.getKey();
            int pointsToAdd = entry.getValue();
            if (pointsToAdd <= 0)
                continue;

            com.lockin.model.UserStat userStat = currentStats.stream()
                    .filter(us -> us.getStat().getName().equals(statName))
                    .findFirst()
                    .orElse(null);

            if (userStat != null) {
                if (userStat.getCurrentValue() + pointsToAdd > 100) {
                    return ResponseEntity.badRequest()
                            .body("La estadística " + statName + " no puede superar los 100 puntos.");
                }
                userStat.setCurrentValue(userStat.getCurrentValue() + pointsToAdd);
                userStatRepository.save(userStat);
            }
        }

        user.setStatPoints(user.getStatPoints() - totalPointsToSpend);
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/profile-picture")
    public ResponseEntity<User> updateProfilePicture(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        
        user.setProfilePic(payload.get("profilePic"));
        User updated = userRepository.save(user);
        return ResponseEntity.ok(updated);
    }
}
