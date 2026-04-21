package com.lockin.controller;

import com.lockin.model.*;
import com.lockin.repository.UserRepository;
import com.lockin.repository.FriendshipRepository;
import com.lockin.repository.UserQuestProgressRepository;
import com.lockin.service.QuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lockin.model.dtos.CreateQuestDTO;
import com.lockin.model.dtos.QuestCompletionResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quests")
public class UserQuestController {

    @Autowired
    private QuestService questService;
    @Autowired
    private UserQuestProgressRepository progressRepository;
    @Autowired
    private FriendshipRepository friendshipRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private com.lockin.repository.QuestRepository questRepository;
    @Autowired
    private com.lockin.repository.ExerciseRepository exerciseRepository;

    /* --- QUEST PLAYER ACTIONS ZONE --- */
    @PostMapping("/{questId}/start")
    public ResponseEntity<Object> startQuest(@PathVariable Long questId, @RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        Quest quest = questRepository.findById(questId).orElse(null);
        if (user == null || quest == null)
            return ResponseEntity.status(404).body("Usuario o Quest no encontrada");

        if ("MUTE".equals(user.getRole())) {
            return ResponseEntity.status(403).body("Tu cuenta está silenciada. No puedes iniciar misiones.");
        }

        // Check for existing active progress
        List<UserQuestProgress> active = progressRepository.findByUserIdAndStatus(userId,
                UserQuestProgress.QuestStatus.ACTIVE);
        if (active.stream().anyMatch(p -> p.getQuest().getId().equals(questId))) {
            return ResponseEntity.badRequest().body("Ya tienes esta misión activa");
        }

        UserQuestProgress progress = new UserQuestProgress();
        progress.setUser(user);
        progress.setQuest(quest);
        progress.setStatus(UserQuestProgress.QuestStatus.ACTIVE);

        return ResponseEntity.ok(progressRepository.save(progress));
    }

    @GetMapping("/active/{userId}")
    public List<UserQuestProgress> getActiveQuests(@PathVariable Long userId) {
        return progressRepository.findByUserIdAndStatus(userId, UserQuestProgress.QuestStatus.ACTIVE);
    }

    @PostMapping("/progress/{progressId}/complete")
    public ResponseEntity<Object> completeQuest(@PathVariable Long progressId) {
        try {
            QuestCompletionResponse response = questService.completeQuest(progressId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/friends/{targetUserId}/custom")
    public ResponseEntity<Object> getFriendsCustomQuests(@RequestParam Long requesterId,
            @PathVariable Long targetUserId) {
        Optional<Friendship> friendship = friendshipRepository.findExistingFriendship(requesterId, targetUserId);

        if (friendship.isPresent() && friendship.get().getStatus() == Friendship.FriendshipStatus.ACCEPTED) {
            List<UserQuestProgress> custom = progressRepository.findByUserIdAndQuestType(targetUserId,
                    Quest.QuestType.CUSTOM);
            return ResponseEntity.ok(custom);
        } else {
            return ResponseEntity.status(403).body("Solo puedes ver las misiones de tus amigos");
        }
    }

    @GetMapping("/custom/all")
    public List<Quest> getCustomQuests(@RequestParam(required = false) Long userId) {
        if (userId != null && userId > 0) {
            return questRepository.findAllForUser(userId, Quest.QuestType.CUSTOM);
        }
        return questRepository.findByType(Quest.QuestType.CUSTOM);
    }

    @PostMapping("/custom")
    public ResponseEntity<Object> createCustomQuest(@RequestBody CreateQuestDTO dto, @RequestParam(required = false) Long userId) {
        try {
            Quest quest = new Quest();
            quest.setTitle(dto.getTitle());
            quest.setType(Quest.QuestType.CUSTOM);
            quest.setCreatorId(userId != null ? userId : 0L);

            List<QuestStep> steps = new ArrayList<>();
            int totalReps = 0;
            int totalSeconds = 0;

            for (CreateQuestDTO.CreateQuestExerciseDTO exDto : dto.getExercises()) {
                Optional<Exercise> optEx = exerciseRepository.findByNameIgnoreCase(exDto.getName());
                Exercise exercise;
                if (optEx.isPresent()) {
                    exercise = optEx.get();
                } else {
                    // Create if missing based on feedback rules
                    exercise = new Exercise();
                    exercise.setName(exDto.getName().toUpperCase());
                    exercise.setType(exDto.getSeconds() != null && exDto.getSeconds() > 0 ? "SECONDS" : "REPS");
                    exercise.setDifficulty("D");
                    exercise = exerciseRepository.save(exercise);
                }

                QuestStep step = new QuestStep();
                step.setQuest(quest);
                step.setExercise(exercise);
                step.setSeries(1); // Default to 1 series
                
                int reps = exDto.getReps() != null ? exDto.getReps() : 0;
                int seconds = exDto.getSeconds() != null ? exDto.getSeconds() : 0;
                
                if (seconds > 0) {
                    step.setRepetitions(seconds); // Fallback repetitions to seconds for UI if needed
                } else {
                    step.setRepetitions(reps);
                }
                
                totalReps += reps;
                totalSeconds += seconds;
                steps.add(step);
            }

            quest.setSteps(steps);

            // Compute Rank
            int totalVolume = totalReps + (totalSeconds / 2); // basic metric
            String rank = "E";
            if (totalVolume >= 1000) rank = "S";
            else if (totalVolume >= 500) rank = "A";
            else if (totalVolume >= 200) rank = "B";
            else if (totalVolume >= 100) rank = "C";
            else if (totalVolume >= 50) rank = "D";
            quest.setRankDifficulty(rank);

            // Compute description
            String generatedDescription = dto.getExercises().stream()
                .map(e -> {
                    if (e.getSeconds() != null && e.getSeconds() > 0) {
                        return e.getSeconds() + "s " + e.getName();
                    }
                    return e.getReps() + " " + e.getName();
                })
                .collect(Collectors.joining(", "));
            quest.setDescription(generatedDescription);

            // Rewards logic
            quest.setXpReward(totalVolume * 2L);
            quest.setGoldReward(totalVolume);

            Quest savedQuest = questRepository.save(quest);
            return ResponseEntity.ok(savedQuest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear la misión: " + e.getMessage());
        }
    }

    @PutMapping("/custom/{id}")
    public ResponseEntity<Object> updateCustomQuest(@PathVariable Long id, @RequestBody CreateQuestDTO dto, @RequestParam Long userId) {
        try {
            Quest quest = questRepository.findById(id).orElse(null);
            if (quest == null) return ResponseEntity.status(404).body("Misión no encontrada");
            
            if (quest.getCreatorId() == 0 || !quest.getCreatorId().equals(userId)) {
                return ResponseEntity.status(403).body("No tienes permiso para modificar esta misión");
            }

            quest.setTitle(dto.getTitle());
            
            // Clear and add new steps
            quest.getSteps().clear();
            List<QuestStep> steps = new ArrayList<>();
            int totalVolume = 0;

            for (CreateQuestDTO.CreateQuestExerciseDTO exDto : dto.getExercises()) {
                Optional<Exercise> optEx = exerciseRepository.findByNameIgnoreCase(exDto.getName());
                Exercise exercise = optEx.orElseGet(() -> {
                    Exercise ex = new Exercise();
                    ex.setName(exDto.getName().toUpperCase());
                    ex.setType(exDto.getSeconds() != null && exDto.getSeconds() > 0 ? "SECONDS" : "REPS");
                    ex.setDifficulty("D");
                    return exerciseRepository.save(ex);
                });

                QuestStep step = new QuestStep();
                step.setQuest(quest);
                step.setExercise(exercise);
                step.setSeries(1);
                
                int reps = exDto.getReps() != null ? exDto.getReps() : 0;
                int seconds = exDto.getSeconds() != null ? exDto.getSeconds() : 0;
                step.setRepetitions(seconds > 0 ? seconds : reps);
                
                totalVolume += (reps + (seconds / 2));
                steps.add(step);
            }
            quest.getSteps().addAll(steps);
            
            // Re-calculate rewards and rank
            String rank = "E";
            if (totalVolume >= 1000) rank = "S";
            else if (totalVolume >= 500) rank = "A";
            else if (totalVolume >= 200) rank = "B";
            else if (totalVolume >= 100) rank = "C";
            else if (totalVolume >= 50) rank = "D";
            quest.setRankDifficulty(rank);
            quest.setXpReward(totalVolume * 2L);
            quest.setGoldReward(totalVolume);

            return ResponseEntity.ok(questRepository.save(quest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar la misión: " + e.getMessage());
        }
    }

    @DeleteMapping("/custom/{id}")
    public ResponseEntity<Object> deleteCustomQuest(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Quest quest = questRepository.findById(id).orElse(null);
            if (quest == null) return ResponseEntity.status(404).body("Misión no encontrada");

            if (quest.getCreatorId() == 0 || !quest.getCreatorId().equals(userId)) {
                return ResponseEntity.status(403).body("No tienes permiso para eliminar esta misión");
            }

            // Verificar si hay progreso asociado
            if (progressRepository.existsByQuestId(id)) {
                return ResponseEntity.badRequest().body("No se puede eliminar la misión: otros usuarios (o tú mismo) tienen progreso activo o completado en ella.");
            }

            questRepository.delete(quest);
            return ResponseEntity.ok("Misión eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar la misión: " + e.getMessage());
        }
    }
    @DeleteMapping("/progress/{progressId}")
    public ResponseEntity<Object> cancelQuest(@PathVariable Long progressId) {
        try {
            if (!progressRepository.existsById(progressId)) {
                return ResponseEntity.status(404).body("Progreso no encontrado");
            }
            progressRepository.deleteById(progressId);
            return ResponseEntity.ok("Misión cancelada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al cancelar la misión: " + e.getMessage());
        }
    }
}
