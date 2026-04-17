import apiClient from './apiClient';

export interface Tip {
  id: number;
  title: string;
  description: string;
}

export const adminService = {
  /**
   * Fetches the global tips list.
   * Path: /api/admin/tips
   */
  getTips: async (): Promise<Tip[]> => {
    return await apiClient<Tip[]>('/api/admin/tips');
  }
};
