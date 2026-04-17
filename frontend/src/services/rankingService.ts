import apiClient from './apiClient';
import { RankingUserDTO } from '../types';

export const rankingService = {
  /**
   * Fetches the global top 10 ranked players.
   * Path: /api/admin/users/top10
   */
  getTop10: async (): Promise<RankingUserDTO[]> => {
    return await apiClient<RankingUserDTO[]>('/api/admin/users/top10');
  },

  /**
   * Fetches all players for a specific league.
   * Path: /api/admin/leagues/{id}/players
   */
  getLeaguePlayers: async (leagueId: number): Promise<RankingUserDTO[]> => {
    return await apiClient<RankingUserDTO[]>(`/api/admin/leagues/${leagueId}/players`);
  },
};
