import { useState, useCallback, useEffect } from 'react';
import { userService } from '../services/userService';
import { PlayerProfile, SurveyData } from '../types';

const mapPushUps = (val: string): number => {
  const mapping: Record<string, number> = { '0-10': 5, '10-30': 20, '30-50': 40, '50+': 60 };
  return mapping[val] || 0;
};

const mapRunTime = (val: string): number => {
  const mapping: Record<string, number> = { '<5M': 4, '10M': 10, '20M': 20, '30M+': 35 };
  return mapping[val] || 0;
};

export const useUser = () => {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => {
    const saved = localStorage.getItem('lockin_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('lockin_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('lockin_profile');
    }
  }, [profile]);

  const submitSurvey = useCallback(async (userId: number, surveyData: SurveyData): Promise<PlayerProfile> => {
    setLoading(true);
    setError(null);
    try {
      const formattedData = {
        userId: userId,
        pushUps: mapPushUps(surveyData.pushUps),
        runTime: mapRunTime(surveyData.runTime),
        goal: surveyData.goal,
        frequency: surveyData.frequency,
        weight: parseFloat(surveyData.weight) || 0,
        height: parseFloat(surveyData.height) || 0
      };
      const data = await userService.submitSurvey(formattedData);
      setProfile(data as PlayerProfile);
      return data as PlayerProfile;
    } catch (err: any) {
      const msg = err.message || 'Survey submission failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: number): Promise<PlayerProfile | undefined> => {
    setLoading(true);
    try {
      const data = await userService.getUserProfile(userId);
      setProfile(data as PlayerProfile);
      return data as PlayerProfile;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
    return undefined;
  }, []);

  const distributeStats = useCallback(async (userId: number, distribution: Record<string, number>): Promise<PlayerProfile> => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.distributeStats(userId, distribution);
      setProfile(data as PlayerProfile);
      return data as PlayerProfile;
    } catch (err: any) {
      setError(err.message || 'Failed to distribute stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, setProfile, loading, error, submitSurvey, fetchProfile, distributeStats };
};
