package com.lockin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lockin.model.User;
import com.lockin.model.UserQuestProgress;
import com.lockin.model.QuestStep;
import com.lockin.model.dtos.UserSurveyDTO;
import com.lockin.repository.UserRepository;
import com.lockin.repository.UserQuestProgressRepository;
import com.lockin.service.UserSurveyService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserSurveyService userSurveyService;
    private final UserRepository userRepository;
    private final UserQuestProgressRepository userQuestProgressRepository;
    private final com.lockin.repository.QuestRepository questRepository;

    public UserController(UserSurveyService userSurveyService,
            UserRepository userRepository,
            UserQuestProgressRepository userQuestProgressRepository,
            com.lockin.repository.QuestRepository questRepository) {
        this.userSurveyService = userSurveyService;
        this.userRepository = userRepository;
        this.userQuestProgressRepository = userQuestProgressRepository;
        this.questRepository = questRepository;
    }

    @PostMapping("/survey")
    public ResponseEntity<User> submitSurvey(@RequestBody UserSurveyDTO dto) {
        User updated = userSurveyService.processSurvey(dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
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

        List<com.lockin.model.Quest> dailyQuests = questRepository.findByType(com.lockin.model.Quest.QuestType.DAILY);

        List<Map<String, Object>> response = new ArrayList<>();

        for (com.lockin.model.Quest quest : dailyQuests) {
            List<UserQuestProgress> progressRows = userQuestProgressRepository
                    .findByUserIdAndQuestId(id, quest.getId());

            UserQuestProgress latest = null;
            if (progressRows != null && !progressRows.isEmpty()) {
                latest = progressRows.stream()
                        .filter(p -> p.getStartTime() != null && p.getStartTime().toLocalDate().equals(today))
                        .sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime()))
                        .findFirst()
                        .orElse(null);
            }

            if (latest == null) {
                latest = new UserQuestProgress();
                latest.setUser(userRepository.getReferenceById(id));
                latest.setQuest(quest);
                latest.setStatus(UserQuestProgress.QuestStatus.ACTIVE);
                latest.setStartTime(now);
                latest.setCompletionTime(null);
                latest = userQuestProgressRepository.save(latest);
            }

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

                    Map<String, Object> exerciseData = new HashMap<>();
                    exerciseData.put("exerciseId", step.getExercise() != null ? step.getExercise().getId() : null);
                    exerciseData.put("exerciseName", step.getExercise() != null ? step.getExercise().getName() : null);
                    exerciseData.put("exerciseType", step.getExercise() != null ? step.getExercise().getType() : null);
                    exerciseData.put("series", step.getSeries());
                    exerciseData.put("repetitionsPerSeries", step.getRepetitions());
                    exerciseData.put("totalRepetitions", stepTotalReps);
                    exerciseData.put("completedRepetitions", completedToday ? stepTotalReps : 0);
                    exercises.add(exerciseData);
                }
            }

            Map<String, Object> progressData = new HashMap<>();
            progressData.put("progressId", latest.getId());
            progressData.put("status", latest.getStatus() != null ? latest.getStatus().name() : null);
            progressData.put("completed", completedToday);
            progressData.put("startTime", latest.getStartTime());
            progressData.put("completionTime", latest.getCompletionTime());

            progressData.put("questId", quest.getId());
            progressData.put("title", quest.getTitle());
            progressData.put("rank", quest.getRankDifficulty());
            progressData.put("difficulty", quest.getRankDifficulty());
            progressData.put("xpReward", quest.getXpReward());
            progressData.put("goldReward", quest.getGoldReward());

            progressData.put("totalRepetitions", totalRepetitions);
            progressData.put("completedRepetitions", completedToday ? totalRepetitions : 0);
            progressData.put("exercises", exercises);

            response.add(progressData);
        }

        return ResponseEntity.ok(response);
    }
}
