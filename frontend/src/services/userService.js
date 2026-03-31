import apiClient from './apiClient';

export const userService = {
  submitSurvey: async (surveyData) => {
    const data = await apiClient('/api/user/survey', { body: surveyData });
    localStorage.setItem('lockin_profile', JSON.stringify(data));
    return data;
  },

  getUserProfile: async (id) => {
    const data = await apiClient(`/api/user/${id}`);
    localStorage.setItem('lockin_profile', JSON.stringify(data));
    return data;
  },

  getDailyQuests: async (userId) => {
    return await apiClient(`/api/user/${userId}/quests/daily/today`);
  }
};
