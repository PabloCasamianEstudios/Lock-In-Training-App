import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { Quest } from '../types';

export const useQuests = (userId: number | null) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await userService.getDailyQuests(userId);
      setQuests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  return { quests, loading, error, fetchQuests };
};
