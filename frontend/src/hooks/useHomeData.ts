import { useState, useEffect, useCallback, useRef } from 'react';
import { useStreak } from './useStreak';
import { userService } from '../services/userService';
import { questService } from '../services/questService';
import { socialService } from '../services/socialService';
import { adminService, Tip } from '../services/adminService';
import { User } from '../types';

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
  // Use a ref so fetchData can read the latest streak value without it being a dep
  const streakRef = useRef(localStreak);
  useEffect(() => { streakRef.current = localStreak; }, [localStreak]);

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
      const fetchProfile = async () => {
        try {
          return await userService.getUserProfile(userId);
        } catch (e) {
          console.error('[API Failure] User Profile:', e);
          return null;
        }
      };

      const fetchActiveQuests = async () => {
        try {
          return await questService.getActiveQuests(userId);
        } catch (e) {
          console.error('[API Failure] Active Quests:', e);
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

      const [profile, activeQuests, friends, activity, fetchedTips] = await Promise.all([
        fetchProfile(),
        fetchActiveQuests(),
        fetchFriends(),
        fetchActivity(),
        fetchTips(),
      ]);

      const defaultTips: Tip[] = [
        { id: 1, title: 'Consistency', description: 'Training daily is key to awakening your potential.' },
        { id: 2, title: 'Rest', description: 'Muscles grow when you sleep. Respect your recovery.' },
        { id: 3, title: 'Hydration', description: 'Drink water during workouts to avoid fatigue.' },
      ];

      const finalTips =
        Array.isArray(fetchedTips) && fetchedTips.length > 0 ? fetchedTips : defaultTips;

      setData({
        username: profile?.username || 'HUNTER',
        profilePic: profile?.profilePic || null,
        activeQuestsCount: Array.isArray(activeQuests) ? activeQuests.length : 0,
        friends: Array.isArray(friends) ? friends : [],
        activity: Array.isArray(activity) ? activity : [],
        tips: finalTips,
        streak: streakRef.current,
        level: profile?.level || 1,
        xp: profile?.xp || 0,
        seasonRank: profile?.seasonRank || 'E',
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('[Critical Error] useHomeData:', err);
      setData(prev => ({ ...prev, loading: false, error: 'Error crítico de conexión' }));
    }
  // localStreak intentionally excluded from deps – accessed via ref to avoid refetch loops
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refresh: fetchData };
};
