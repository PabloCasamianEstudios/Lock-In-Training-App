import React, { useState, FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Trophy, Zap, Shield, Brain, Star, Wind } from 'lucide-react';
import { PlayerProfile } from '../../types';
import { useLanguage } from '../../LanguageContext';

interface LevelUpModalProps {
  profile: PlayerProfile;
  onDistribute: (distribution: Record<string, number>) => Promise<any>;
}

const STAT_CONFIG: Record<string, { icon: any; color: string; key: string }> = {
  STR: { icon: Zap, color: 'text-green-400', key: 'str' },
  AGI: { icon: Zap, color: 'text-yellow-400', key: 'agi' },
  VIT: { icon: Shield, color: 'text-red-500', key: 'vit' },
  INT: { icon: Brain, color: 'text-blue-400', key: 'int' },
  LUK: { icon: Star, color: 'text-purple-400', key: 'luk' },
  SPD: { icon: Wind, color: 'text-cyan-400', key: 'spd' },
};

export const LevelUpModal: FC<LevelUpModalProps> = ({ profile, onDistribute }) => {
  const { t } = useLanguage();
  const [availablePoints, setAvailablePoints] = useState(profile.statPoints || 0);
  const [points, setPoints] = useState<Record<string, number>>({
    STR: 0, AGI: 0, VIT: 0, INT: 0, LUK: 0, SPD: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when profile points change (e.g. if leveling up while modal is open)
  useEffect(() => {
    console.log('[DEBUG] LevelUpModal useEffect triggered. Prop StatPoints:', profile.statPoints);
    setAvailablePoints(profile.statPoints || 0);
    setPoints({ STR: 0, AGI: 0, VIT: 0, INT: 0, LUK: 0, SPD: 0 });
    setIsSubmitting(false);
  }, [profile.statPoints]);

  useEffect(() => {
    console.log('[DEBUG] LevelUpModal mounted with availablePoints:', availablePoints);
  }, []);

  const handleIncrement = (stat: string) => {
    const currentValue = (profile.stats as any)?.[stat] || 0;
    const addedValue = points[stat] || 0;

    if (availablePoints > 0 && (currentValue + addedValue) < 100) {
      setPoints(prev => ({ ...prev, [stat]: (prev[stat] || 0) + 1 }));
      setAvailablePoints(prev => prev - 1);
    }
  };

  const handleDecrement = (stat: string) => {
    if (points[stat] > 0) {
      setPoints(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
      setAvailablePoints(prev => prev + 1);
    }
  };

  const handleConfirm = async () => {
    if (availablePoints > 0) return;
    setIsSubmitting(true);
    try {
      await onDistribute(points);
    } catch (err) {
      console.error('Error distributing stats:', err);
      setIsSubmitting(false);
    }
  };

  if (!profile.statPoints || profile.statPoints <= 0) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md md:max-w-3xl bg-zinc-900 border-4 border-main shadow-[8px_8px_0px_rgba(var(--main-rgb),0.3)] flex flex-col font-rpg max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-main p-4 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-black animate-bounce" />
          <div>
            <h2 className="text-xl font-black text-black italic leading-none uppercase">{t('level_up.title')}</h2>
            <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest mt-1">{t('level_up.assign_points')}</p>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Points Counter */}
          <div className="flex items-center justify-between bg-black/40 border-2 border-white/10 p-4 rounded-sm">
            <span className="text-xs font-black text-white/40 uppercase tracking-tighter">{t('level_up.available_points')}</span>
            <span className="text-4xl font-black text-main italic pr-2">{availablePoints}</span>
          </div>

          {/* Stats List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(STAT_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const label = t(`level_up.stats.${config.key}`);
              const currentValue = (profile.stats as any)?.[key] || 0;
              const addedValue = points[key] || 0;
              const totalAfter = currentValue + addedValue;
              const isMaxed = totalAfter >= 100;

              return (
                <motion.div
                  key={key}
                  layout
                  className={`relative bg-black border-4 ${isMaxed ? 'border-main' : 'border-white/10'} p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.5)]`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isMaxed ? 'text-main' : 'text-white'}`} />
                      <span className={`font-black italic uppercase text-xs ${isMaxed ? 'text-main' : 'text-white/60'}`}>{label}</span>
                    </div>
                    <span className="text-xl font-black italic text-white tracking-widest">
                      {currentValue}
                      {addedValue > 0 && <span className="text-main ml-2">+{addedValue}</span>}
                      <span className="text-[10px] text-white/20 ml-1">/ 100</span>
                    </span>
                  </div>

                  {/* Bar Container */}
                  <div className="h-4 bg-white/5 border-2 border-white/10 relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentValue}%` }}
                      className="absolute inset-y-0 left-0 bg-white/20"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${addedValue}%` }}
                      style={{ left: `${currentValue}%` }}
                      className="absolute inset-y-0 bg-main shadow-[0_0_15px_rgba(var(--main-rgb),0.5)]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => handleDecrement(key)}
                      disabled={!points[key]}
                      className="w-10 h-10 border-2 border-white/20 flex items-center justify-center text-white/40 hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleIncrement(key)}
                      disabled={availablePoints <= 0 || isMaxed}
                      className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-main hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={availablePoints > 0 || isSubmitting}
            className={`w-full py-4 font-black uppercase italic tracking-widest transition-all
              ${availablePoints === 0
                ? 'bg-main text-black hover:scale-[1.02] active:scale-[0.98] shadow-[4px_4px_0px_#000]'
                : 'bg-zinc-800 text-white/20 cursor-not-allowed'}`}
          >
            {isSubmitting ? t('level_up.awakening') : availablePoints > 0 ? t('level_up.assign_more').replace('{{n}}', String(availablePoints)) : t('level_up.confirm')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LevelUpModal;
