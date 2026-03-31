import { useState, useCallback, useEffect } from 'react';
import { userService } from '../services/userService';

const mapPushUps = (val) => {
  const mapping = { '0-10': 5, '10-30': 20, '30-50': 40, '50+': 60 };
  return mapping[val] || 0;
};

const mapRunTime = (val) => {
  const mapping = { '<5M': 4, '10M': 10, '20M': 20, '30M+': 35 };
  return mapping[val] || 0;
};

export const useUser = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('lockin_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('lockin_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('lockin_profile');
    }
  }, [profile]);

  const submitSurvey = useCallback(async (userId, surveyData) => {
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
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    setLoading(true);
    try {
      const data = await userService.getUserProfile(userId);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, setProfile, loading, error, submitSurvey, fetchProfile };
};
