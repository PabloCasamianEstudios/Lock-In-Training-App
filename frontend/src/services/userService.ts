import apiClient from './apiClient';
import { User, Quest } from '../types';

export const userService = {
  submitSurvey: async (surveyData: any): Promise<User> => {
    const data = await apiClient<User>('/api/user/survey', { body: surveyData });
    localStorage.setItem('lockin_profile', JSON.stringify(data));
    return data;
  },

  getUserProfile: async (id: number, saveLocal: boolean = true): Promise<User> => {
    const data = await apiClient<User>(`/api/user/${id}`);
    if (saveLocal) {
      localStorage.setItem('lockin_profile', JSON.stringify(data));
    }
    return data;
  }
};

