package com.lockin.service;

import com.lockin.model.*;
import com.lockin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SystemQuestService {

    @Autowired
    private QuestRepository questRepository;
    @Autowired
    private ExerciseRepository exerciseRepository;
    @Autowired
    private SystemQuestOfferRepository offerRepository;
    @Autowired
    private UserRepository userRepository;

    private static final List<String> RANKS = Arrays.asList("E", "D", "C", "B", "A", "S");

    @Transactional
    public void generateGlobalPool() {

        List<Exercise> exercises = exerciseRepository.findAll();
        if (exercises.isEmpty()) {
            throw new RuntimeException("No hay ejercicios en la base de datos para generar misiones.");
        }

        Random rand = new Random();

        for (String rank : RANKS) {
            long existingCount = questRepository.findAll().stream()
                    .filter(q -> q.getType() == Quest.QuestType.SYSTEM && rank.equals(q.getRankDifficulty()))
                    .count();

            int toGenerate = 50 - (int) existingCount;
            if (toGenerate <= 0)
                continue;

            for (int i = 0; i < toGenerate; i++) {
                Quest quest = new Quest();
                quest.setType(Quest.QuestType.SYSTEM);
                quest.setRankDifficulty(rank);
                quest.setCreatorId(0L); // System
                quest.setTitle("Contrato de Rango " + rank + " #" + (existingCount + i + 1));

                int rankVal = RANKS.indexOf(rank) + 1; // 1 to 6

                // 1. Número de ejercicios escala con el rango
                int numSteps;
                if (rankVal <= 2)
                    numSteps = 1 + rand.nextInt(2); // E, D: 1-2
                else if (rankVal <= 5)
                    numSteps = 2 + rand.nextInt(2); // C: 2-3
                else
                    numSteps = 3 + rand.nextInt(2); // B, A, S: 3-4

                // 2. Multiplicadores de repeticiones mucho más agresivos
                // E: 1x, D: 2x, C: 5x, B: 12x, A: 25x, S: 50x
                double[] repMultipliers = { 1.0, 2.0, 4.0, 6.0, 8.0, 10.0 };
                double repMult = repMultipliers[rankVal - 1];

                List<QuestStep> steps = new ArrayList<>();
                int totalVolume = 0;

                // Barajar ejercicios para asegurar que son únicos en esta misión
                List<Exercise> shuffledExercises = new ArrayList<>(exercises);
                Collections.shuffle(shuffledExercises);

                for (int j = 0; j < Math.min(numSteps, shuffledExercises.size()); j++) {
                    Exercise ex = shuffledExercises.get(j);
                    QuestStep step = new QuestStep();
                    step.setQuest(quest);
                    step.setExercise(ex);
                    step.setSeries(1);

                    int base = ex.getBaseReps() > 0 ? ex.getBaseReps() : (ex.getBaseDuration() / 5);
                    if (base <= 0)
                        base = 10;

                    int reps = (int) (base * repMult);
                    step.setRepetitions(reps);
                    totalVolume += (reps * step.getSeries());
                    steps.add(step);
                }
                quest.setSteps(steps);

                // Descripción automática
                String desc = steps.stream()
                        .map(s -> s.getSeries() + "x" + s.getRepetitions() + " " + s.getExercise().getName())
                        .collect(Collectors.joining(", "));
                quest.setDescription(desc);

                quest.setGoldReward(totalVolume * 2L);
                quest.setXpReward(totalVolume * 5L);

                questRepository.save(quest);
            }
        }
    }

    @Transactional
    public List<SystemQuestOffer> getOrFillOffers(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        List<SystemQuestOffer> currentOffers = new ArrayList<>(offerRepository.findByUserId(userId));

        // Calcular distribución ideal para el rango ACTUAL (usando seasonRank)
        String userRank = user.getSeasonRank() != null ? user.getSeasonRank() : "E";
        int userRankIdx = RANKS.indexOf(userRank);
        if (userRankIdx == -1)
            userRankIdx = 0;

        System.out.println("[SystemQuestService] Fetching offers for User: " + user.getUsername() + " | Current Rank: "
                + userRank);

        String r = RANKS.get(userRankIdx);
        String rMinus = RANKS.get(Math.max(0, userRankIdx - 1));
        String rPlus = RANKS.get(Math.min(RANKS.size() - 1, userRankIdx + 1));

        Map<String, Integer> targets = new HashMap<>();
        targets.put(r, 2);
        // Si ya somos rango E, el 'rMinus' sumará al E. Si somos S, 'rPlus' sumará al
        // S.
        targets.put(rMinus, targets.getOrDefault(rMinus, 0) + 2);
        targets.put(rPlus, targets.getOrDefault(rPlus, 0) + 2);

        System.out.println("[SystemQuestService] Ideal target distribution: " + targets);

        // 1. Identificar misiones que sobran o ya no encajan
        List<SystemQuestOffer> toDelete = new ArrayList<>();
        Map<String, Integer> currentCounts = new HashMap<>();

        for (SystemQuestOffer offer : currentOffers) {
            String qRank = offer.getQuest().getRankDifficulty();
            int needed = targets.getOrDefault(qRank, 0);
            int current = currentCounts.getOrDefault(qRank, 0);

            if (current < needed) {
                currentCounts.put(qRank, current + 1);
            } else {
                System.out.println("[SystemQuestService] Purging offer ID " + offer.getId() + " (Rank " + qRank
                        + ") - Does not fit current distribution.");
                toDelete.add(offer);
            }
        }

        if (!toDelete.isEmpty()) {
            offerRepository.deleteAll(toDelete);
            offerRepository.flush(); // Asegurar borrado inmediato
            currentOffers.removeAll(toDelete);
        }

        // 2. Rellenar si faltan hasta llegar a 6 con la nueva distribución
        if (currentOffers.size() < 6) {
            System.out.println("[SystemQuestService] Gaps detected (" + currentOffers.size() + "/6). Filling gaps...");
            fillGaps(user, currentOffers);
            return offerRepository.findByUserId(userId);
        }

        return currentOffers;
    }

    private void fillGaps(User user, List<SystemQuestOffer> currentOffers) {
        int userRankIdx = RANKS.indexOf(user.getSeasonRank() != null ? user.getSeasonRank() : "E");
        if (userRankIdx == -1)
            userRankIdx = 0;

        // Necesitamos: 2 de R, 2 de R-1, 2 de R+1
        Map<String, Integer> targets = new HashMap<>();
        String r = RANKS.get(userRankIdx);
        String rMinus = RANKS.get(Math.max(0, userRankIdx - 1));
        String rPlus = RANKS.get(Math.min(RANKS.size() - 1, userRankIdx + 1));

        targets.put(r, 2);
        targets.put(rMinus, targets.getOrDefault(rMinus, 0) + 2);
        targets.put(rPlus, targets.getOrDefault(rPlus, 0) + 2);

        // Contar qué tenemos ya
        for (SystemQuestOffer offer : currentOffers) {
            String qRank = offer.getQuest().getRankDifficulty();
            if (targets.containsKey(qRank)) {
                targets.put(qRank, targets.get(qRank) - 1);
            }
        }

        // Rellenar
        List<Quest> allSystemQuests = questRepository.findAll().stream()
                .filter(q -> q.getType() == Quest.QuestType.SYSTEM)
                .collect(Collectors.toList());

        Set<Long> currentQuestIds = currentOffers.stream()
                .map(o -> o.getQuest().getId())
                .collect(Collectors.toSet());

        for (Map.Entry<String, Integer> entry : targets.entrySet()) {
            String targetRank = entry.getKey();
            int countNeeded = entry.getValue();

            if (countNeeded <= 0)
                continue;

            List<Quest> candidates = allSystemQuests.stream()
                    .filter(q -> q.getRankDifficulty().equals(targetRank) && !currentQuestIds.contains(q.getId()))
                    .collect(Collectors.toList());

            Collections.shuffle(candidates);

            for (int i = 0; i < Math.min(countNeeded, candidates.size()); i++) {
                SystemQuestOffer offer = new SystemQuestOffer();
                offer.setUser(user);
                offer.setQuest(candidates.get(i));
                offerRepository.save(offer);
                currentQuestIds.add(candidates.get(i).getId());
            }
        }
    }

    @Transactional
    public void removeOffer(Long userId, Long questId) {
        List<SystemQuestOffer> offers = offerRepository.findByUserId(userId);
        offers.stream()
                .filter(o -> o.getQuest().getId().equals(questId))
                .findFirst()
                .ifPresent(offerRepository::delete);
    }

    public double calculateMultiplier(User user, Quest quest) {
        int userRankIdx = RANKS.indexOf(user.getSeasonRank() != null ? user.getSeasonRank() : "E");
        if (userRankIdx == -1)
            userRankIdx = 0;

        int questRankIdx = RANKS.indexOf(quest.getRankDifficulty() != null ? quest.getRankDifficulty() : "E");
        if (questRankIdx == -1)
            questRankIdx = 0;

        if (questRankIdx > userRankIdx)
            return 1.5;
        if (questRankIdx < userRankIdx)
            return 0.5;
        return 1.0;
    }
}
