import apiClient from './apiClient';
import { LoginResponse } from '../types';

export const authService = {
  login: async (credentials: any): Promise<LoginResponse> => {
    const data = await apiClient<LoginResponse>('/api/auth/login', { body: credentials });
    if (data.token) {
      localStorage.setItem('lockin_token', data.token);
      localStorage.setItem('lockin_user', JSON.stringify(data));
    }
    return data;
  },

  register: async (userData: any): Promise<any> => {
    return await apiClient('/api/auth/register', { body: userData });
  },

  logout: (): void => {
    localStorage.removeItem('lockin_token');
    localStorage.removeItem('lockin_user');
    localStorage.removeItem('lockin_profile');
  }
};
