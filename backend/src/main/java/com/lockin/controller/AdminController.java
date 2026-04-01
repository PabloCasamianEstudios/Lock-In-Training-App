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

    @Autowired private UserRepository userRepository;
    @Autowired private QuestRepository questRepository;
    @Autowired private ExerciseRepository exerciseRepository;
    @Autowired private AchievementRepository achievementRepository;
    @Autowired private StatRepository statRepository;
    @Autowired private TipRepository tipRepository;
    @Autowired private TitleRepository titleRepository;
    @Autowired private LeagueRepository leagueRepository;
    @Autowired private UserLeagueRepository userLeagueRepository;
    @Autowired private UserTitleRepository userTitleRepository;

    /* --- SPECIAL QUERIES ZONE --- */
    @GetMapping("/users/top10")
    public List<com.lockin.model.dtos.RankingUserDTO> getTop10Users() {
        return userRepository.findTop10ByOrderByTotalPointsDesc().stream()
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
                .totalPoints(user.getTotalPoints())
                .build();
    }

    /* --- CRUD ZONE: USERS --- */
    @GetMapping("/users")
    public List<User> getAllUsers() { return userRepository.findAll(); }

    @GetMapping("/users/{id}")
    public ResponseEntity<Object> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/users")
    public User createUser(@RequestBody User entity) { return userRepository.save(entity); }

    @PutMapping("/users/{id}")
    public ResponseEntity<Object> updateUser(@PathVariable Long id, @RequestBody User entity) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
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

    // --- QUESTS ---
    @GetMapping("/quests")
    public List<Quest> getAllQuests() { return questRepository.findAll(); }

    @GetMapping("/quests/{id}")
    public ResponseEntity<Object> getQuest(@PathVariable Long id) {
        return questRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/quests")
    public Quest createQuest(@RequestBody Quest entity) { return questRepository.save(entity); }

    @PutMapping("/quests/{id}")
    public ResponseEntity<Object> updateQuest(@PathVariable Long id, @RequestBody Quest entity) {
        if (!questRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
        entity.setId(id);
        return ResponseEntity.ok(questRepository.save(entity));
    }

    @DeleteMapping("/quests/{id}")
    public ResponseEntity<Object> deleteQuest(@PathVariable Long id) {
        if (!questRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
        questRepository.deleteById(id);
        return ResponseEntity.ok("Eliminado correctamente");
    }

    // --- EXERCISES ---
    @GetMapping("/exercises")
    public List<Exercise> getAllExercises() { return exerciseRepository.findAll(); }

    @GetMapping("/exercises/{id}")
    public ResponseEntity<Object> getExercise(@PathVariable Long id) {
        return exerciseRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/exercises")
    public Exercise createExercise(@RequestBody Exercise entity) { return exerciseRepository.save(entity); }

    @DeleteMapping("/exercises/{id}")
    public ResponseEntity<Object> deleteExercise(@PathVariable Long id) {
        if (!exerciseRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
        exerciseRepository.deleteById(id);
        return ResponseEntity.ok("Eliminado correctamente");
    }

    // --- ACHIEVEMENTS ---
    @GetMapping("/achievements")
    public List<Achievement> getAllAchievements() { return achievementRepository.findAll(); }

    @GetMapping("/achievements/{id}")
    public ResponseEntity<Object> getAchievement(@PathVariable Long id) {
        return achievementRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    @PostMapping("/achievements")
    public Achievement createAchievement(@RequestBody Achievement entity) { return achievementRepository.save(entity); }

    @DeleteMapping("/achievements/{id}")
    public ResponseEntity<Object> deleteAchievement(@PathVariable Long id) {
        if (!achievementRepository.existsById(id)) {
            return ResponseEntity.status(404).body("El id no existe");
        }
        achievementRepository.deleteById(id);
        return ResponseEntity.ok("Eliminado correctamente");
    }

    // --- STATS ---
    @GetMapping("/stats")
    public List<Stat> getAllStats() { return statRepository.findAll(); }

    @GetMapping("/stats/{id}")
    public ResponseEntity<Object> getStat(@PathVariable Long id) {
        return statRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    // --- LEAGUES ---
    @GetMapping("/leagues")
    public List<League> getAllLeagues() { return leagueRepository.findAll(); }

    @GetMapping("/leagues/{id}")
    public ResponseEntity<Object> getLeague(@PathVariable Long id) {
        return leagueRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    // --- TIPS ---
    @GetMapping("/tips")
    public List<Tip> getAllTips() { return tipRepository.findAll(); }

    @GetMapping("/tips/{id}")
    public ResponseEntity<Object> getTip(@PathVariable Long id) {
        return tipRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }

    // --- TITLES ---
    @GetMapping("/titles")
    public List<Title> getAllTitles() { return titleRepository.findAll(); }

    @GetMapping("/titles/{id}")
    public ResponseEntity<Object> getTitle(@PathVariable Long id) {
        return titleRepository.findById(id)
                .map(entity -> ResponseEntity.ok((Object) entity))
                .orElse(ResponseEntity.status(404).body("El id no existe"));
    }
}
