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
  },

  /**
   * Executes a generic admin API request with complex URL construction.
   */
  executeAdminRequest: async (entity: string, type: string, method: string, testId?: string, requestBody?: string) => {
    let url = `/api/admin/${entity}`;

    if (type === 'custom-top10') {
      url = `/api/admin/users/top10`;
    } else if (type === 'custom-league-players') {
      if (!testId) throw new Error("League ID is required");
      url = `/api/admin/leagues/${testId}/players`;
    } else if (type === 'custom-league-generate') {
      const max = testId || '5';
      url = `/api/leagues/generate?maxUsersPerLeague=${max}`;
    } else if (type === 'users-custom-quests') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/admin/users/${testId}/custom-quests`;
    } else if (type === 'social-request') {
      const body = JSON.parse(requestBody || '{}');
      url = `/api/social/friends/request?senderId=${body.senderId}&receiverId=${body.receiverId}`;
    } else if (type === 'social-accept') {
      if (!testId) throw new Error("Request ID is required");
      url = `/api/social/friends/accept/${testId}`;
    } else if (type === 'social-list') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/social/friends/${testId}`;
    } else if (type === 'quest-complete') {
      if (!testId) throw new Error("Progress ID is required");
      url = `/api/quests/progress/${testId}/complete`;
    } else if (type === 'quest-start') {
      const body = JSON.parse(requestBody || '{}');
      url = `/api/quests/${testId}/start?userId=${body.userId}`;
    } else if (type === 'quest-active') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/quests/active/${testId}`;
    } else if (type === 'quest-system-pool') {
      url = `/api/admin/quests/generate-system-pool`;
    } else if (type === 'quest-assign-dailies') {
      url = `/api/admin/quests/assign-daily-mandatories`;
    } else if (type === 'comp-monthly') {
      url = `/api/admin/competitive/monthly-update`;
    } else if (type === 'comp-season') {
      url = `/api/admin/competitive/season-reset`;
    } else if (type === 'comp-ranks') {
      url = `/api/admin/competitive/refresh-ranks`;
    } else if (type === 'mod-muted') {
      url = `/api/admin/moderation/muted`;
    } else if (type === 'mod-unmute') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/admin/moderation/unmute/${testId}`;
    } else if (type === 'mod-mute') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/admin/moderation/mute/${testId}`;
    } else if (type === 'shop-list') {
      url = `/api/shop/items`;
    } else if (type === 'shop-buy-item') {
      const [uId, iId] = (testId || '').split(',');
      if (!uId || !iId) throw new Error("Format: userId,itemId");
      url = `/api/shop/purchase/item/${uId}/${iId}`;
    } else if (type === 'shop-buy-title') {
      const [uId, tId] = (testId || '').split(',');
      if (!uId || !tId) throw new Error("Format: userId,titleId");
      url = `/api/shop/purchase/title/${uId}/${tId}`;
    } else if (type === 'users-custom-stats') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/user/${testId}/stats`;
    } else if (type === 'users-items') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/user/${testId}/items`;
    } else if (type === 'users-titles') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/user/${testId}/titles`;
    } else if (type === 'users-league-players') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/user/${testId}/league-players`;
    } else if (type === 'users-distribute-stats') {
      if (!testId) throw new Error("User ID is required");
      url = `/api/user/${testId}/distribute-stats`;
    } else if (type === 'id' || method === 'delete' || method === 'put') {
      if (!testId) throw new Error("ID is required for this operation");
      url += `/${testId}`;
    }

    const options: any = { method: method.toUpperCase() };
    if (requestBody && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
      options.body = JSON.parse(requestBody);
    }

    return await apiClient<any>(url, options);
  },

  /**
   * Deletes a record from a specific entity.
   */
  deleteRecord: async (entity: string, id: number) => {
    return await apiClient<any>(`/api/admin/${entity}/${id}`, { method: 'DELETE' });
  }
};
