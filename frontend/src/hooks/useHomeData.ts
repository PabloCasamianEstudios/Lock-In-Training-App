import { useState, useEffect, useCallback } from 'react';
import { useStreak } from './useStreak';
import apiClient from '../services/apiClient';
import { User, Quest, PlayerProfile } from '../types';

interface Tip {
  id: number;
  title: string;
  description: string;
}

interface HomeData {
  username: string;
  profilePic: string | null;
  activeQuestsCount: number;
  friends: User[];
  activity: any[];
  tips: Tip[];
  streak: number;
  level: number;
  xp: number;
  seasonRank: string;
  loading: boolean;
  error: string | null;
}

export const useHomeData = (userId: number | undefined) => {
  const localStreak = useStreak();
  const [data, setData] = useState<HomeData>({
    username: 'HUNTER',
    profilePic: null,
    activeQuestsCount: 0,
    friends: [],
    activity: [],
    tips: [],
    streak: 0,
    level: 1,
    xp: 0,
    seasonRank: 'E',
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!userId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const results = await Promise.allSettled([
        apiClient<User>(`/api/user/${userId}`),
        apiClient<any[]>(`/api/quests/active/${userId}`),
        apiClient<User[]>(`/api/social/friends/${userId}`),
        apiClient<any[]>(`/api/user/${userId}/quests`),
        apiClient<Tip[]>('/api/admin/tips'),
      ]);

      const [userRes, activeQuestRes, friendsRes, activityRes, tipsRes] = results;

      const profile = userRes.status === 'fulfilled' ? userRes.value : null;
      const activeQuests = activeQuestRes.status === 'fulfilled' ? activeQuestRes.value : [];
      const friends = friendsRes.status === 'fulfilled' ? friendsRes.value : [];
      const activity = activityRes.status === 'fulfilled' ? activityRes.value : [];
      
      const defaultTips: Tip[] = [
        { id: 1, title: 'Consistency', description: 'Training daily is key to awakening your potential.' },
        { id: 2, title: 'Rest', description: 'Muscles grow when you sleep. Respect your recovery.' },
        { id: 3, title: 'Hydration', description: 'Drink water during workouts to avoid fatigue.' }
      ];
      const fetchedTips = tipsRes.status === 'fulfilled' ? tipsRes.value : [];
      const finalTips = (Array.isArray(fetchedTips) && fetchedTips.length > 0) ? fetchedTips : defaultTips;

      setData({
        username: profile?.username || 'HUNTER',
        profilePic: profile?.profilePic || null,
        activeQuestsCount: activeQuests?.length || 0,
        friends: Array.isArray(friends) ? friends : [],
        activity: Array.isArray(activity) ? activity : [],
        tips: finalTips,
        streak: localStreak,
        level: profile?.level || 1,
        xp: profile?.xp || 0,
        seasonRank: profile?.seasonRank || 'E',
        loading: false,
        error: userRes.status === 'rejected' ? 'Error al cargar perfil principal' : null,
      });
    } catch (err: any) {
      setData(prev => ({ ...prev, loading: false, error: 'Error crítico de conexión' }));
    }
  }, [userId, localStreak]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refresh: fetchData };
};
