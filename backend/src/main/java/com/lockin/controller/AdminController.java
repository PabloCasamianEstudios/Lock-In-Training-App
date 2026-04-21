package com.lockin.controller;

import com.lockin.model.*;
import com.lockin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private QuestRepository questRepository;
    @Autowired
    private ExerciseRepository exerciseRepository;
    @Autowired
    private AchievementRepository achievementRepository;
    @Autowired
    private StatRepository statRepository;
    @Autowired
    private TipRepository tipRepository;
    @Autowired
    private TitleRepository titleRepository;
    @Autowired
    private LeagueRepository leagueRepository;
    @Autowired
    private UserLeagueRepository userLeagueRepository;
    @Autowired
    private UserTitleRepository userTitleRepository;
    @Autowired
    private UserQuestProgressRepository userQuestProgressRepository;
    @Autowired
    private com.lockin.service.CompetitiveService competitiveService;

    /* --- COMPETITIVE MANAGEMENT ZONE --- */
    @PostMapping("/competitive/monthly-update")
    public ResponseEntity<Object> triggerMonthlyUpdate() {
        try {
            competitiveService.processMonthlyLeagueUpdate();
            return ResponseEntity.ok("Rotación mensual de ligas completada");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error en rotación: " + e.getMessage());
        }
    }

    @PostMapping("/competitive/season-reset")
    public ResponseEntity<Object> triggerSeasonReset() {
        try {
            competitiveService.processSeasonCycleEnd();
            return ResponseEntity.ok("Reinicio de temporada y stats (True Reset) completado");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error en reset: " + e.getMessage());
        }
    }

    @PostMapping("/competitive/refresh-ranks")
    public ResponseEntity<Object> triggerRefreshRanks() {
        try {
            competitiveService.refreshGlobalPrestigeRanks();
            return ResponseEntity.ok("Ranking global (S-E) actualizado");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error en ranking: " + e.getMessage());
        }
    }

    /* --- SPECIAL QUERIES ZONE --- */
    @GetMapping("/users/top10")
    public List<com.lockin.model.dtos.RankingUserDTO> getTop10Users() {
        return userRepository.findTop10ByOrderBySeasonPointsDesc().stream()
                .map(this::mapToRankingDTO)
                .toList();
    }

    @GetMapping("/users/all")
    public List<com.lockin.model.dtos.RankingUserDTO> getAllRankedUsers() {
        return userRepository.findAllByOrderBySeasonPointsDesc().stream()
                .map(this::mapToRankingDTO)
                .toList();
    }

    @GetMapping("/leagues/{id}/players")
    public ResponseEntity<Object> getLeaguePlayers(@PathVariable Long id) {
        if (!leagueRepository.existsById(id)) {
            return ResponseEntity.status(404).body("La liga no existe");
        }
        List<com.lockin.model.dtos.RankingUserDTO> players = userLeagueRepository.findByLeagueId(id).stream()
                .map(ul -> mapToRankingDTO(ul.getUser()))
                .toList();
        return ResponseEntity.ok(players);
    }

    @GetMapping("/users/{id}/custom-quests")
    public ResponseEntity<Object> getCustomQuests(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
        return ResponseEntity.ok(userQuestProgressRepository.findByUserIdAndQuestType(id, Quest.QuestType.CUSTOM));
    }

    private com.lockin.model.dtos.RankingUserDTO mapToRankingDTO(User user) {
        String titleName = userTitleRepository.findByUserIdAndIsEquippedTrue(user.getId())
                .map(ut -> ut.getTitle().getName())
                .orElse("Sin Título");

        return com.lockin.model.dtos.RankingUserDTO.builder()
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

    /* --- CRUD ZONE: USERS --- */
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Object> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/users")
    public ResponseEntity<Object> createUser(@RequestBody User entity) {
        if (entity.getUsername() == null || entity.getUsername().isEmpty())
            return ResponseEntity.badRequest().body("Nombre de usuario requerido");
        if (entity.getEmail() == null || entity.getEmail().isEmpty())
            return ResponseEntity.badRequest().body("Email requerido");
        if (entity.getPassword() == null || entity.getPassword().isEmpty())
            return ResponseEntity.badRequest().body("Contraseña requerida");
        return ResponseEntity.ok(userRepository.save(entity));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Object> updateUser(@PathVariable Long id, @RequestBody User entity) {
        if (!userRepository.existsById(id))
            return ResponseEntity.status(404).body("El id no existe");
        if (entity.getUsername() == null || entity.getUsername().isEmpty())
            return ResponseEntity.badRequest().body("Nombre de usuario requerido");
        entity.setId(id);
        return ResponseEntity.ok(userRepository.save(entity));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Object> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("Eliminado correctamente");
    }

    /* --- CRUD ZONE: QUESTS --- */
    @GetMapping("/quests")
    public List<Quest> getAllQuests() {
        return questRepository.findAll();
    }

    @GetMapping("/quests/{id}")
    public ResponseEntity<Object> getQuest(@PathVariable Long id) {
        return questRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/quests")
    public ResponseEntity<Object> createQuest(@RequestBody Quest entity) {
        if (entity.getTitle() == null || entity.getTitle().isEmpty())
            return ResponseEntity.badRequest().body("Título requerido");
        if (entity.getType() == null)
            return ResponseEntity.badRequest().body("Tipo de quest requerido");

        /* --- NESTED STEPS BINDING ZONE --- */
        if (entity.getSteps() != null) {
            entity.getSteps().forEach(step -> step.setQuest(entity));
        }
        return ResponseEntity.ok(questRepository.save(entity));
    }

    @PutMapping("/quests/{id}")
    public ResponseEntity<Object> updateQuest(@PathVariable Long id, @RequestBody Quest entity) {
        if (!questRepository.existsById(id))
            return ResponseEntity.status(404).body("El id no existe");
        if (entity.getTitle() == null || entity.getTitle().isEmpty())
            return ResponseEntity.badRequest().body("Título requerido");

        entity.setId(id);
        /* --- NESTED STEPS BINDING ZONE --- */
        if (entity.getSteps() != null) {
            entity.getSteps().forEach(step -> step.setQuest(entity));
        }
        return ResponseEntity.ok(questRepository.save(entity));
    }

    @DeleteMapping("/quests/{id}")
    public ResponseEntity<Object> deleteQuest(@PathVariable Long id) {
        if (!questRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
        
        // Verificar si hay progreso asociado
        if (userQuestProgressRepository.existsByQuestId(id)) {
            return ResponseEntity.badRequest().body("No se puede eliminar la misión: usuarios tienen progreso activo o completado en ella.");
        }

        questRepository.deleteById(id);
        return ResponseEntity.ok("Eliminado correctamente");
    }

    /* --- CRUD ZONE: EXERCISES --- */
    @GetMapping("/exercises")
    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    @GetMapping("/exercises/{id}")
    public ResponseEntity<Object> getExercise(@PathVariable Long id) {
        return exerciseRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/exercises")
    public ResponseEntity<Object> createExercise(@RequestBody Exercise entity) {
        if (entity.getName() == null || entity.getName().isEmpty())
            return ResponseEntity.badRequest().body("Nombre requerido");
        return ResponseEntity.ok(exerciseRepository.save(entity));
    }

    @DeleteMapping("/exercises/{id}")
    public ResponseEntity<Object> deleteExercise(@PathVariable Long id) {
        if (!exerciseRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
        exerciseRepository.deleteById(id);
        return ResponseEntity.ok("Eliminado correctamente");
    }

    /* --- CRUD ZONE: ACHIEVEMENTS --- */
    @GetMapping("/achievements")
    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }

    @GetMapping("/achievements/{id}")
    public ResponseEntity<Object> getAchievement(@PathVariable Long id) {
        return achievementRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/achievements")
    public ResponseEntity<Object> createAchievement(@RequestBody Achievement entity) {
        if (entity.getTitle() == null || entity.getTitle().isEmpty())
            return ResponseEntity.badRequest().body("Título requerido");
        return ResponseEntity.ok(achievementRepository.save(entity));
    }

    @DeleteMapping("/achievements/{id}")
    public ResponseEntity<Object> deleteAchievement(@PathVariable Long id) {
        if (!achievementRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
        achievementRepository.deleteById(id);
        return ResponseEntity.ok("Eliminado correctamente");
    }

    /* --- CRUD ZONE: STATS --- */
    @GetMapping("/stats")
    public List<Stat> getAllStats() {
        return statRepository.findAll();
    }

    @GetMapping("/stats/{id}")
    public ResponseEntity<Object> getStat(@PathVariable Long id) {
        return statRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/stats")
    public ResponseEntity<Object> createStat(@RequestBody Stat entity) {
        if (entity.getName() == null || entity.getName().isEmpty())
            return ResponseEntity.badRequest().body("Nombre requerido");
        return ResponseEntity.ok(statRepository.save(entity));
    }

    /* --- CRUD ZONE: LEAGUES --- */
    @GetMapping("/leagues")
    public List<League> getAllLeagues() {
        return leagueRepository.findAll();
    }

    @GetMapping("/leagues/{id}")
    public ResponseEntity<Object> getLeague(@PathVariable Long id) {
        return leagueRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/leagues")
    public ResponseEntity<Object> createLeague(@RequestBody League entity) {
        if (entity.getRank() == null || entity.getRank().isEmpty())
            return ResponseEntity.badRequest().body("Rango requerido");
        return ResponseEntity.ok(leagueRepository.save(entity));
    }

    /* --- CRUD ZONE: TIPS --- */
    @GetMapping("/tips")
    public List<Tip> getAllTips() {
        return tipRepository.findAll();
    }

    @GetMapping("/tips/{id}")
    public ResponseEntity<Object> getTip(@PathVariable Long id) {
        return tipRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/tips")
    public ResponseEntity<Object> createTip(@RequestBody Tip entity) {
        if (entity.getTitle() == null || entity.getTitle().isEmpty())
            return ResponseEntity.badRequest().body("Título requerido");
        return ResponseEntity.ok(tipRepository.save(entity));
    }

    /* --- CRUD ZONE: TITLES --- */
    @GetMapping("/titles")
    public List<Title> getAllTitles() {
        return titleRepository.findAll();
    }

    @GetMapping("/titles/{id}")
    public ResponseEntity<Object> getTitle(@PathVariable Long id) {
        return titleRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/titles")
    public ResponseEntity<Object> createTitle(@RequestBody Title entity) {
        if (entity.getName() == null || entity.getName().isEmpty())
            return ResponseEntity.badRequest().body("Nombre requerido");
        return ResponseEntity.ok(titleRepository.save(entity));
    }
}
