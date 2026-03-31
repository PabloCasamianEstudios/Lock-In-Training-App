import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

export const useQuests = (userId) => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuests = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await userService.getDailyQuests(userId);
      setQuests(data);
    } catch (err) {
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
