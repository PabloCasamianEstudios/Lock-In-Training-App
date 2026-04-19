import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { questService } from '../services/questService';
import { socialService } from '../services/socialService';
import { adminService, Tip } from '../services/adminService';
import { User, Quest } from '../types';

interface HomeData {
  username: string;
  profilePic: string | null;
  activeQuestsCount: number;
  dailyQuests: Quest[];
  friends: User[];
  activity: any[];
  tips: Tip[];
  streak: number;
  level: number;
  xp: number;
  rank: string;
  loading: boolean;
  error: string | null;
}

export const useHomeData = (userId: number | undefined) => {
  const [data, setData] = useState<HomeData>({
    username: 'HUNTER',
    profilePic: null,
    activeQuestsCount: 0,
    dailyQuests: [],
    friends: [],
    activity: [],
    tips: [],
    streak: 0,
    level: 1,
    xp: 0,
    rank: 'E',
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
      const fetchProfile = async () => {
        try {
          return await userService.getUserProfile(userId);
        } catch (e) {
          console.error('[API Failure] User Profile:', e);
          return null;
        }
      };

      const fetchDailies = async () => {
        try {
          return await questService.getDailyQuests(userId);
        } catch (e) {
          console.error('[API Failure] Daily Quests:', e);
          return [];
        }
      };

      const fetchFriends = async () => {
        try {
          return await socialService.getFriends(userId);
        } catch (e) {
          console.error('[API Failure] Friends:', e);
          return [];
        }
      };

      const fetchActivity = async () => {
        try {
          return await questService.getUserQuests(userId);
        } catch (e) {
          console.error('[API Failure] Activity:', e);
          return [];
        }
      };

      const fetchTips = async () => {
        try {
          return await adminService.getTips();
        } catch (e) {
          console.error('[API Failure] Tips:', e);
          return [];
        }
      };

      const [profile, dailyQuests, friends, activity, fetchedTips] = await Promise.all([
        fetchProfile(),
        fetchDailies(),
        fetchFriends(),
        fetchActivity(),
        fetchTips(),
      ]);

      const defaultTips: Tip[] = [
        { id: 1, title: 'Consistency', description: 'Training daily is key to awakening your potential.' },
        { id: 2, title: 'Rest', description: 'Muscles grow when you sleep. Respect your recovery.' },
        { id: 3, title: 'Hydration', description: 'Drink water during workouts to avoid fatigue.' },
      ];

      const finalTips = Array.isArray(fetchedTips) && fetchedTips.length > 0 ? fetchedTips : defaultTips;

      const validDailies = Array.isArray(dailyQuests) ? dailyQuests : [];
      const pendingDailies = validDailies.filter(q => !q.completed);

      setData({
        username: profile?.username || 'HUNTER',
        profilePic: profile?.profilePic || null,
        activeQuestsCount: pendingDailies.length,
        dailyQuests: validDailies,
        friends: Array.isArray(friends) ? friends : [],
        activity: Array.isArray(activity) ? activity : [],
        tips: finalTips,
        streak: profile?.streak || 0,
        level: profile?.level || 1,
        xp: profile?.xp || 0,
        rank: profile?.rank || 'E',
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('[Critical Error] useHomeData:', err);
      setData(prev => ({ ...prev, loading: false, error: 'Error crítico de conexión' }));
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refresh: fetchData };
};
