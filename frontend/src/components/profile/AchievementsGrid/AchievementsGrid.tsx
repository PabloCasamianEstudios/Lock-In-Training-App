import { FC } from 'react';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Achievement {
  id: string;
  title: string;
  completed: boolean;
}

interface AchievementsGridProps {
  achievements: Achievement[];
}

const AchievementsGrid: FC<AchievementsGridProps> = ({ achievements }) => {
  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <Trophy className="w-12 h-12 text-white/10" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20 italic">No achievements unlocked yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {achievements.map((ach, i) => (
        <motion.div
          key={ach.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex flex-col items-center justify-center p-6 border-4 transition-all duration-300 transform -skew-x-3 ${
            ach.completed
              ? 'bg-main/10 border-main shadow-[4px_4px_0px_var(--main-color)] scale-105'
              : 'bg-black border-white/10 opacity-60 grayscale'
          }`}
        >
          <Trophy className={`w-10 h-10 mb-3 ${ach.completed ? 'text-main' : 'text-white/40'}`} />
          <span className={`text-[10px] font-black uppercase text-center italic tracking-widest ${ach.completed ? 'text-white' : 'text-white/40'}`}>
            {ach.title}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default AchievementsGrid;
