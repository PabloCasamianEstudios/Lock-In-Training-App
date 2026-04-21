import { useState, useEffect, useCallback } from 'react';
import { rankingService } from '../services/rankingService';
import { socialService } from '../services/socialService';
import { RankingUserDTO, User } from '../types';

type RankingTab = 'ALL' | 'FRIENDS' | 'YOUR_LEAGUE';

interface RankingsData {
  globalTop: RankingUserDTO[];
  friends: User[];
  leaguePlayers: RankingUserDTO[];
  loading: boolean;
  error: string | null;
}

export const useRankings = (userId: number | undefined) => {
  const [activeTab, setActiveTab] = useState<RankingTab>('ALL');
  const [data, setData] = useState<RankingsData>({
    globalTop: [],
    friends: [],
    leaguePlayers: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    const fetchGlobal = async () => {
      try {
        return await rankingService.getAll();
      } catch (e) {
        console.error('[Rankings] Global top10 failed:', e);
        return [];
      }
    };

    const fetchFriends = async () => {
      if (!userId) return [];
      try {
        return await socialService.getFriends(userId);
      } catch (e) {
        console.error('[Rankings] Friends failed:', e);
        return [];
      }
    };

    const fetchLeague = async () => {
      if (!userId) return [];
      try {
        return await rankingService.getUserLeaguePlayers(userId);
      } catch (e) {
        console.error('[Rankings] League players failed:', e);
        return [];
      }
    };

    const [globalTop, friends, leaguePlayers] = await Promise.all([
      fetchGlobal(),
      fetchFriends(),
      fetchLeague()
    ]);

    setData({
      globalTop,
      friends,
      leaguePlayers,
      loading: false,
      error: null,
    });
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, activeTab, setActiveTab, refresh: fetchData };
};
