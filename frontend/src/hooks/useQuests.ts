import { useState, useEffect, useCallback } from 'react';
import { questService } from '../services/questService';
import { Quest } from '../types';

export const useQuests = (userId: number | null) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeQuest, setActiveQuest] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const dailyPromise = questService.getDailyQuests(userId).catch(err => {
        console.error("Daily Quests Error:", err);
        return [] as Quest[];
      });
      const activePromise = questService.getActiveQuests(userId).catch(err => {
        console.error("Active Quests Error:", err);
        return [] as any[];
      });

      const [daily, active] = await Promise.all([dailyPromise, activePromise]);
      setQuests(daily || []);

      // The active quest endpoint returns UserQuestProgress objects from Spring JPA.
      // Normalize it so ActiveQuestView can access: activeProgress.id (progressId),
      // activeProgress.startTime, and activeProgress.quest.steps[].exercise.name
      if (active && active.length > 0) {
        const raw = active[0];
        // Ensure the nested quest.steps are accessible (Spring serializes them)
        const normalizedActive = {
          id: raw.id ?? raw.progressId,
          startTime: raw.startTime ?? new Date().toISOString(),
          status: raw.status ?? 'ACTIVE',
          quest: raw.quest ?? {
            id: raw.questId,
            title: raw.title ?? 'Quest',
            steps: raw.steps ?? [],
          },
        };
        setActiveQuest(normalizedActive);
      } else {
        setActiveQuest(null);
      }
    } catch (err: any) {
      setError(`Failed to synchronize with quest protocol: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const startQuest = async (questId: number) => {
    if (!userId) return;
    setLoading(true);
    try {
      // questId here is already the backend quest ID (mapped from questId field)
      await questService.startQuest(userId, questId);
      await fetchData();
    } catch (err: any) {
      console.error('[useQuests] startQuest error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeQuest = async (progressId: number) => {
    setLoading(true);
    try {
      await questService.completeQuest(progressId);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCustomQuest = async (data: any) => {
    // Mocking custom quest creation as backend might not have it yet
    console.log("Mock creating custom quest:", data);
    const newQuest: Quest = {
      id: Math.floor(Math.random() * 10000),
      title: data.title,
      description: data.description || '',
      type: 'CUSTOM',
      rankDifficulty: 'D',
      goldReward: 50,
      xpReward: 100,
      steps: data.exercises.map((ex: any, i: number) => ({
        id: i,
        exercise: { name: ex.name },
        series: 1,
        repetitions: ex.reps || 0,
        duration: ex.seconds || 0
      })) as any
    };
    
    // Save to local storage for persistence across reloads in this session if mock
    const localCustoms = JSON.parse(localStorage.getItem(`custom_quests_${userId}`) || '[]');
    localStorage.setItem(`custom_quests_${userId}`, JSON.stringify([...localCustoms, newQuest]));
    
    await fetchData();
    return newQuest;
  };

  const getCustomQuests = useCallback(() => {
    return JSON.parse(localStorage.getItem(`custom_quests_${userId}`) || '[]');
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    quests, 
    activeQuest, 
    loading, 
    error, 
    fetchQuests: fetchData, 
    startQuest, 
    completeQuest,
    createCustomQuest,
    getCustomQuests
  };
};

