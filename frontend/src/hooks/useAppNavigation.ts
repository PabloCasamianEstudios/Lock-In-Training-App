import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useUser } from './useUser';
import { AppScreen } from '../types/navigation';

export function useAppNavigation() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const { user, setUser, logout } = useAuth();
  const { profile, setProfile, submitSurvey, fetchProfile, distributeStats } = useUser();

  const handleSplashComplete = useCallback(async () => {
    if (user) {
      if (profile && profile.stats && profile.rank) {
        setScreen('hub');
        return;
      }
      try {
        const upToDateProfile = await fetchProfile(user.id);
        // Saltamos la encuesta forzando el Hub
        setScreen('hub');
      } catch (err) {
        setScreen('hub');
      }
    } else {
      setScreen('auth');
    }
  }, [user, profile, fetchProfile]);

  const handleAuthComplete = useCallback(async (userData: any) => {
    setUser(userData);
    if (profile && userData.id === profile.userId && (profile.stats || profile.rank)) {
      setScreen('hub');
      return;
    }
    try {
      await fetchProfile(userData.id);
      setScreen('hub');
    } catch (err) {
      setScreen('hub');
    }
  }, [setUser, profile, fetchProfile]);

  const handleGuestEntry = useCallback(() => {
    const guestUser = { id: 0, username: 'GuestPlayer', rank: 'E', isGuest: true };
    const guestProfile = {
      rank: 'E',
      level: 1,
      xp: 0,
      coins: 0,
      stats: { STR: 5, VIT: 5, AGI: 5, INT: 5, DISC: 5, LUK: 5 }
    };
    setUser(guestUser);
    setProfile(guestProfile);
    setScreen('hub');
  }, [setUser, setProfile]);

  const handleSurveyComplete = async (surveyData: any) => {
    if (!user?.id) return;
    setScreen('analyzing');
    try {
      const playerProfile = await submitSurvey(user.id, surveyData);
      setProfile(playerProfile);
    } catch (err) {
      const defaultProfile = {
        userId: user?.id,
        rank: 'E',
        level: 1,
        xp: 0,
        coins: 0,
        stats: { STR: 0, VIT: 0, AGI: 0, INT: 0, DISC: 0, LUK: 0 }
      };
      setProfile(defaultProfile);
    }
  };

  const handleAnalysisComplete = () => {
    if (profile) {
      setScreen('result');
    } else {
      setScreen('hub');
    }
  };

  const handleEnterHub = () => {
    setScreen('hub');
  };

  const handleLogout = () => {
    logout();
    setScreen('splash');
  };

  return {
    screen,
    setScreen,
    user,
    profile,
    handleSplashComplete,
    handleAuthComplete,
    handleGuestEntry,
    handleSurveyComplete,
    handleAnalysisComplete,
    handleEnterHub,
    handleLogout,
    distributeStats,
    fetchProfile
  };
}
