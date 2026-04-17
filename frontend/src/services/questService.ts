import apiClient from './apiClient';
import { Quest } from '../types';

/**
 * The backend /api/user/{id}/quests/daily/today returns a flat DTO with different
 * field names than the frontend Quest interface. This function maps them.
 */
const mapDailyDTO = (dto: any): Quest => ({
  id: dto.questId ?? dto.id,
  title: dto.title ?? '',
  description: dto.description ?? '',
  type: dto.type ?? 'DAILY',
  rankDifficulty: dto.rank ?? dto.rankDifficulty ?? 'E',
  xpReward: dto.xpReward ?? 0,
  goldReward: dto.goldReward ?? 0,
  steps: dto.steps ?? [],
  // carry over extra DTO fields so the UI can use progressId, completed, etc.
  ...(dto as any),
});

export const questService = {
  /**
   * Fetches daily quests for a specific user for today.
   * Path: /api/user/{id}/quests/daily/today
   * NOTE: backend returns flat DTOs (questId, rank, …) → mapped to Quest shape.
   */
  getDailyQuests: async (userId: number): Promise<Quest[]> => {
    const raw = await apiClient<any[]>(`/api/user/${userId}/quests/daily/today`);
    return Array.isArray(raw) ? raw.map(mapDailyDTO) : [];
  },

  /**
   * Fetches all active quest progress for a specific user.
   * Path: /api/quests/active/{userId}
   * Returns UserQuestProgress objects with a nested `quest` field.
   */
  getActiveQuests: async (userId: number): Promise<any[]> => {
    const raw = await apiClient<any[]>(`/api/quests/active/${userId}`);
    return Array.isArray(raw) ? raw : [];
  },

  /**
   * Starts a quest for a user.
   * Path: /api/quests/{questId}/start?userId={userId}
   */
  startQuest: async (userId: number, questId: number): Promise<any> => {
    return await apiClient(`/api/quests/${questId}/start?userId=${userId}`, { method: 'POST' });
  },

  /**
   * Marks a quest progress as completed.
   * Path: /api/quests/progress/{progressId}/complete
   */
  completeQuest: async (progressId: number): Promise<any> => {
    return await apiClient(`/api/quests/progress/${progressId}/complete`, { method: 'POST' });
  },

  /**
   * Fetches all quest activity (progress history) for a user.
   * Path: /api/user/{id}/quests
   */
  getUserQuests: async (userId: number): Promise<any[]> => {
    const raw = await apiClient<any[]>(`/api/user/${userId}/quests`);
    return Array.isArray(raw) ? raw : [];
  },

  /**
   * Fetches custom quests of a friend.
   * Path: /api/quests/friends/{targetUserId}/custom?requesterId={userId}
   */
  getFriendsCustomQuests: async (userId: number, targetUserId: number): Promise<any> => {
    return await apiClient(`/api/quests/friends/${targetUserId}/custom?requesterId=${userId}`);
  }
};
