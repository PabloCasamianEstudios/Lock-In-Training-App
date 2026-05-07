package com.lockin.service;

import com.lockin.model.*;
import com.lockin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
                quest.setCreatorId(0L);
                quest.setTitle("Contrato de Rango " + rank + " #" + (existingCount + i + 1));

                int rankVal = RANKS.indexOf(rank) + 1;

                // Número de ejercicios escala con el rango
                int numSteps;
                if (rankVal <= 2)
                    numSteps = 1 + rand.nextInt(2); // E, D: 1-2
                else if (rankVal <= 5)
                    numSteps = 2 + rand.nextInt(2); // C, B, A: 2-3
                else
                    numSteps = 3 + rand.nextInt(2); // S: 3-4

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
        targets.put(rMinus, targets.getOrDefault(rMinus, 0) + 2);
        targets.put(rPlus, targets.getOrDefault(rPlus, 0) + 2);

        System.out.println("[SystemQuestService] Ideal target distribution: " + targets);
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
            offerRepository.flush();
            currentOffers.removeAll(toDelete);
        }

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

        Map<String, Integer> targets = new HashMap<>();
        String r = RANKS.get(userRankIdx);
        String rMinus = RANKS.get(Math.max(0, userRankIdx - 1));
        String rPlus = RANKS.get(Math.min(RANKS.size() - 1, userRankIdx + 1));

        targets.put(r, 2);
        targets.put(rMinus, targets.getOrDefault(rMinus, 0) + 2);
        targets.put(rPlus, targets.getOrDefault(rPlus, 0) + 2);

        for (SystemQuestOffer offer : currentOffers) {
            String qRank = offer.getQuest().getRankDifficulty();
            if (targets.containsKey(qRank)) {
                targets.put(qRank, targets.get(qRank) - 1);
            }
        }

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

    @Transactional
    public UserQuestProgress generateMandatoryDaily(User user) {
        LocalDate today = LocalDate.now();
        // Salvaguarda: Si ya tiene una diaria hoy, no crear otra
        Optional<UserQuestProgress> existing = userQuestProgressRepository.findByUserId(user.getId()).stream()
                .filter(p -> p.isMandatoryDaily() 
                          && p.getStartTime() != null 
                          && p.getStartTime().toLocalDate().equals(today))
                .findFirst();
        
        if (existing.isPresent()) {
            return existing.get();
        }

        String rank = (user.getSeasonRank() != null) ? user.getSeasonRank() : "E";
        List<Quest> pool = questRepository.findByType(Quest.QuestType.SYSTEM).stream()
                .filter(q -> rank.equals(q.getRankDifficulty()))
                .toList();

        if (pool.isEmpty())
            return null;

        Quest base = pool.get(new Random().nextInt(pool.size()));

        Quest daily = new Quest();
        daily.setTitle("DIARIA: " + base.getTitle());
        daily.setType(Quest.QuestType.DAILY);
        daily.setRankDifficulty(base.getRankDifficulty());
        daily.setXpReward(base.getXpReward() * 3);
        daily.setGoldReward(base.getGoldReward() * 3);
        daily.setCreatorId(user.getId());

        if (base.getSteps() != null) {
            for (QuestStep bs : base.getSteps()) {
                QuestStep ds = new QuestStep();
                ds.setExercise(bs.getExercise());
                ds.setSeries(bs.getSeries());
                ds.setRepetitions((int) (bs.getRepetitions() * 1.5));
                daily.addStep(ds);
            }
        }

        // Generar descripción basada en los nuevos steps
        String desc = daily.getSteps().stream()
                .map(s -> s.getSeries() + "x" + s.getRepetitions() + " " + s.getExercise().getName())
                .collect(Collectors.joining(", "));
        daily.setDescription(desc);

        daily = questRepository.save(daily);
        questRepository.flush();

        UserQuestProgress progress = new UserQuestProgress();
        progress.setUser(user);
        progress.setQuest(daily);
        progress.setMandatoryDaily(true);
        progress.setStatus(UserQuestProgress.QuestStatus.ACTIVE);
        progress.setStartTime(LocalDateTime.now());
        progress.setAppliedGoldReward(daily.getGoldReward());
        progress.setAppliedXpReward(daily.getXpReward());

        return userQuestProgressRepository.save(progress);
    }

    @Autowired
    private UserQuestProgressRepository userQuestProgressRepository;
}
