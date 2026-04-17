import apiClient from './apiClient';
import { User } from '../types';

export const socialService = {
  /**
   * Fetches the accepted friends list for a specific user.
   * Path: /api/social/friends/{userId}
   */
  getFriends: async (userId: number): Promise<User[]> => {
    return await apiClient<User[]>(`/api/social/friends/${userId}`);
  },

  /**
   * Sends a friend request.
   * Path: /api/social/friends/request?senderId={senderId}&receiverId={receiverId}
   */
  sendFriendRequest: async (senderId: number, receiverId: number): Promise<any> => {
    return await apiClient(`/api/social/friends/request?senderId=${senderId}&receiverId=${receiverId}`, { method: 'POST' });
  },

  /**
   * Accepts a friend request.
   * Path: /api/social/friends/accept/{requestId}
   */
  acceptFriendRequest: async (requestId: number): Promise<any> => {
    return await apiClient(`/api/social/friends/accept/${requestId}`, { method: 'POST' });
  }
};
