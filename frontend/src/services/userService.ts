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

  distributeStats: async (userId: number, distribution: Record<string, number>): Promise<User> => {
    const data = await apiClient<User>(`/api/user/${userId}/distribute-stats`, { body: distribution });
    localStorage.setItem('lockin_profile', JSON.stringify(data));
    return data;
  }
};

