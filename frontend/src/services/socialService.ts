import apiClient from "./apiClient";
import { User } from "../types";

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
    sendFriendRequest: async (
        senderId: number,
        receiverId: number,
    ): Promise<any> => {
        return await apiClient(
            `/api/social/friends/request?senderId=${senderId}&receiverId=${receiverId}`,
            { method: "POST" },
        );
    },

    /**
     * Accepts a friend request.
     * Path: /api/social/friends/accept/{requestId}
     */
    acceptFriendRequest: async (requestId: number): Promise<any> => {
        return await apiClient(`/api/social/friends/accept/${requestId}`, {
            method: "POST",
        });
    },

    /**
     * Fetches pending friend requests for a user.
     * Path: /api/social/friends/requests/pending/{userId}
     */
    getPendingRequests: async (userId: number): Promise<any[]> => {
        return await apiClient(
            `/api/social/friends/requests/pending/${userId}`,
        );
    },

    /**
     * Rejects a friend request.
     * Path: /api/social/friends/reject/{requestId}
     */
    rejectFriendRequest: async (requestId: number): Promise<any> => {
        return await apiClient(`/api/social/friends/reject/${requestId}`, {
            method: "POST",
        });
    },

    /**
     * Gets friendship status between two users.
     */
    getFriendshipStatus: async (
        u1: number,
        u2: number,
    ): Promise<{ status: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED" }> => {
        return await apiClient<{
            status: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED";
        }>(`/api/social/friends/status?u1=${u1}&u2=${u2}`);
    },

};
