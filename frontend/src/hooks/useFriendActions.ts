import { useState } from 'react';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';

export function useFriendActions(userId: number | undefined, refreshData: () => void) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchStatus, setSearchStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF' | 'NOT_FOUND' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async (currentUsername?: string) => {
    if (!searchQuery.trim() || !userId) return;
    if (currentUsername && searchQuery.toLowerCase() === currentUsername.toLowerCase()) {
      setSearchStatus('SELF');
      setSearchResult({ id: userId, username: currentUsername });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);
    setSearchStatus(null);
    try {
      const foundUser = await userService.getUserByUsername(searchQuery);
      if (foundUser) {
        setSearchResult(foundUser);
        const statusData = await socialService.getFriendshipStatus(userId, foundUser.id);
        setSearchStatus(statusData.status);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResult(null);
      setSearchStatus('NOT_FOUND');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (targetId: number) => {
    if (!userId) return;
    setIsAdding(true);
    try {
      await socialService.sendFriendRequest(userId, targetId);
      setSearchStatus('PENDING');
      refreshData();
    } catch (err) {
      console.error('Failed to send request:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await socialService.acceptFriendRequest(requestId);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await socialService.rejectFriendRequest(requestId);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResult,
    searchStatus,
    isSearching,
    isAdding,
    handleSearch,
    handleAddFriend,
    handleAcceptRequest,
    handleRejectRequest
  };
}
