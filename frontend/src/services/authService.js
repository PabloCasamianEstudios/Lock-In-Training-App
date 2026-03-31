import apiClient from './apiClient';

export const authService = {
  login: async (credentials) => {
    const data = await apiClient('/api/auth/login', { body: credentials });
    if (data.token) {
      localStorage.setItem('lockin_token', data.token);
      localStorage.setItem('lockin_user', JSON.stringify(data));
    }
    return data;
  },

  register: async (userData) => {
    return await apiClient('/api/auth/register', { body: userData });
  },

  logout: () => {
    localStorage.removeItem('lockin_token');
    localStorage.removeItem('lockin_user');
    localStorage.removeItem('lockin_profile');
  }
};
