import { useState, useEffect, useCallback } from 'react';
import { questService } from '../services/questService';
import { Quest } from '../types';

export const useQuests = (userId: number | null) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [customQuests, setCustomQuests] = useState<Quest[]>([]);
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
      const customPromise = questService.getGlobalCustomQuests(userId).catch(err => {
        console.error("Custom Quests Error:", err);
        return [] as Quest[];
      });

      const [daily, active, globalCustom] = await Promise.all([dailyPromise, activePromise, customPromise]);
      setQuests(Array.isArray(daily) ? daily.slice(0, 1) : []);
      setCustomQuests(globalCustom || []);


      if (active && active.length > 0) {
        const raw = active[0];
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
      const response = await questService.completeQuest(progressId);
      console.log('premioss: ', response);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCustomQuest = async (data: any) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const newQuest = await questService.createCustomQuest(userId, data);
      await fetchData();
      return newQuest;
    } catch (err: any) {
      console.error('[useQuests] createCustomQuest error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomQuest = async (questId: number, data: any) => {
    if (!userId) return null;
    setLoading(true);
    try {
      await questService.updateCustomQuest(userId, questId, data);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomQuest = async (questId: number) => {
    if (!userId) return null;
    setLoading(true);
    try {
      await questService.deleteCustomQuest(userId, questId);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelQuest = async (progressId: number) => {
    setLoading(true);
    try {
      await questService.cancelQuest(progressId);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCustomQuests = useCallback(() => {
    return customQuests;
  }, [customQuests]);

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
    cancelQuest,
    createCustomQuest,
    updateCustomQuest,
    deleteCustomQuest,
    getCustomQuests
  };
};
