import { useState, useEffect } from 'react';

interface StreakData {
  count: number;
  lastVisit: string; 
}

const STREAK_KEY = 'lockin_user_streak';

const getLocalDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
};

export const useStreak = () => {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const todayStr = getLocalDateString(new Date());
    const yesterdayStr = getYesterdayDateString();
    
    const saved = localStorage.getItem(STREAK_KEY);
    let currentData: StreakData;

    if (!saved) {
      currentData = { count: 1, lastVisit: todayStr };
    } else {
      const parsed: StreakData = JSON.parse(saved);
      
      if (parsed.lastVisit === todayStr) {
        currentData = parsed;
      } else if (parsed.lastVisit === yesterdayStr) {
        currentData = { count: parsed.count + 1, lastVisit: todayStr };
      } else {
        currentData = { count: 1, lastVisit: todayStr };
      }
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(currentData));
    setStreak(currentData.count);
  }, []);

  return streak;
};
