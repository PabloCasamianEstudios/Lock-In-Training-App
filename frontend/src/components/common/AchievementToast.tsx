import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { Achievement } from '../../types';
import { useLanguage } from '../../LanguageContext';

const AchievementToast = () => {
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const handleAchievement = (e: Event) => {
      const customEvent = e as CustomEvent<Achievement[]>;
      if (customEvent.detail && customEvent.detail.length > 0) {
        setAchievements(prev => [...prev, ...customEvent.detail]);
      }
    };

    window.addEventListener('achievement_unlocked', handleAchievement);
    return () => window.removeEventListener('achievement_unlocked', handleAchievement);
  }, []);

  // Remove the oldest achievement after 5 seconds
  useEffect(() => {
    if (achievements.length > 0) {
      const timer = setTimeout(() => {
        setAchievements(prev => prev.slice(1));
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [achievements]);

  const currentAchievement = achievements[0];

  return (
    <AnimatePresence>
      {currentAchievement && (
        <motion.div
          key={currentAchievement.id}
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, x: 50 }}
          className="fixed bottom-24 right-4 md:right-8 z-[100] max-w-sm w-full bg-black border-4 border-main p-4 shadow-[8px_8px_0_var(--main-color)]"
        >
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 flex-shrink-0 bg-main/20 flex items-center justify-center border-2 border-main transform -skew-x-12 relative overflow-hidden">
               <div className="absolute inset-0 bg-main opacity-20 animate-pulse" />
              <Trophy className="text-main w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-main italic tracking-[0.2em] mb-1">
                {t('achievement_toast.unlocked')}
              </p>
              <h4 className="text-white font-black uppercase text-lg leading-tight truncate">
                {currentAchievement.title}
              </h4>
              <p className="text-white/60 text-xs italic mt-1 line-clamp-2 uppercase">
                {currentAchievement.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;
