import apiClient from './apiClient';
import { RankingUserDTO } from '../types';

export const rankingService = {
  getTop10: async (): Promise<RankingUserDTO[]> => {
    try {
      const users = await apiClient<any[]>('/api/admin/users/top10');
      return users.map(user => ({
        id: user.id,
        username: user.username,
        profilePic: user.profilePic,
        title: user.title || 'Hunter',
        level: user.level || 1,
        rank: user.rank || 'E',
        seasonRank: user.seasonRank || 'E',
        totalPoints: user.totalPoints || 0,
        seasonPoints: user.seasonPoints || 0
      })).sort((a, b) => b.seasonPoints - a.seasonPoints);
    } catch (e) {
      console.warn('Ranking fetch failed. Returning empty list.', e);
      return [];
    }
  },

  getAll: async (): Promise<RankingUserDTO[]> => {
    try {
      const users = await apiClient<any[]>('/api/admin/users/all');
      return users.map(user => ({
        id: user.id,
        username: user.username,
        profilePic: user.profilePic,
        title: user.title || 'Hunter',
        level: user.level || 1,
        rank: user.rank || 'E',
        seasonRank: user.seasonRank || 'E',
        totalPoints: user.totalPoints || 0,
        seasonPoints: user.seasonPoints || 0
      })).sort((a, b) => b.seasonPoints - a.seasonPoints);
    } catch (e) {
      console.warn('Ranking fetch failed. Returning empty list.', e);
      return [];
    }
  },

  /**
   * all players for a specific league.
   * /api/admin/leagues/{id}/players
   */
  getLeaguePlayers: async (leagueId: number): Promise<RankingUserDTO[]> => {
    return await apiClient<RankingUserDTO[]>(`/api/admin/leagues/${leagueId}/players`);
  },
};
