import apiClient from './apiClient';
import { User, Quest } from '../types';

export const userService = {
  submitSurvey: async (surveyData: any): Promise<User> => {
    const data = await apiClient<User>('/api/user/survey', { body: surveyData });
    localStorage.setItem('lockin_profile', JSON.stringify(data));
    return data;
  },

  getUserProfile: async (id: number, saveLocal: boolean = true): Promise<any> => {
    const [user, stats] = await Promise.all([
      apiClient<any>(`/api/user/${id}`),
      apiClient<any[]>(`/api/user/${id}/stats`)
    ]);
    
    const statsMap = Array.isArray(stats) 
      ? stats.reduce((acc, s) => ({ ...acc, [s.name]: s.value }), {}) 
      : {};
      
    const fullProfile = { ...user, stats: statsMap };
    
    if (saveLocal) {
      localStorage.setItem('lockin_profile', JSON.stringify(fullProfile));
    }
    return fullProfile;
  },
  
  getUserAchievements: async (id: number): Promise<any[]> => {
    return apiClient<any[]>(`/api/user/${id}/achievements`);
  },

  getUserTitles: async (id: number): Promise<any[]> => {
    return apiClient<any[]>(`/api/user/${id}/titles`);
  },

  equipTitle: async (userId: number, titleId: number): Promise<void> => {
    await apiClient<void>(`/api/user/${userId}/equip-title/${titleId}`, { method: 'POST' });
  },

  distributeStats: async (userId: number, distribution: Record<string, number>): Promise<any> => {
    await apiClient<any>(`/api/user/${userId}/distribute-stats`, { body: distribution });
    return userService.getUserProfile(userId);
  },

  checkDailyStatus: async (userId: number): Promise<boolean> => {
    return apiClient<boolean>(`/api/user/${userId}/daily-completed`);
  },
  
  updateProfilePicture: async (userId: number, profilePic: string): Promise<User> => {
    const updated = await apiClient<User>(`/api/user/${userId}/profile-picture`, {
      method: 'PUT',
      body: { profilePic }
    });
    localStorage.setItem('lockin_profile', JSON.stringify(updated));
    return updated;
  }
};
