import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Heart, Brain, Target, Star, Swords, RefreshCw } from 'lucide-react';
import type { PlayerProfile, PlayerStats } from '../../../types';

interface RankAssignmentProps {
  profile: PlayerProfile | null;
  onRestart: () => void;
  onEnterHub: () => void;
}

const statIcons: Record<string, FC<{ className?: string }>> = {
  STR: Swords,
  AGI: Zap,
  VIT: Heart,
  INT: Brain,
  DEX: Target,
  LUK: Star,
  DISC: Shield
};

const containerVariants = {
  hidden: { opacity: 0, scale: 1.2, x: 200 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      duration: 0.8,
      bounce: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }
};

const RankAssignment: FC<RankAssignmentProps> = ({ profile, onRestart, onEnterHub }) => {
  const { 
    stats = { STR: 1, AGI: 1, VIT: 1, INT: 1, DEX: 1, LUK: 1, DISC: 1 } as PlayerStats, 
    rank = 'E', 
    level = 1, 
    username = 'HUNTER',
    biometria = {} 
  } = profile || {};

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="smash-slash opacity-20" />
      <div className="scanline" />

      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
        <h1 className="text-[40vw] font-black italic tracking-tighter transform -rotate-12">INITIALIZED</h1>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl relative z-10"
      >
        <div className="system-card border-white shadow-[20px_20px_0px_var(--main-color)] p-0 md:flex rounded-none overflow-hidden bg-white/5 backdrop-blur-md">
          <div className="w-full md:w-2/5 bg-main p-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex items-center justify-center">
              <span className="text-[20rem] font-black italic tracking-tighter text-black">RANK</span>
            </div>
            
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 8, stiffness: 100, delay: 0.4 }}
              className="relative z-10 group"
            >
              <div className="text-[14rem] font-black italic leading-none text-white tracking-tighter drop-shadow-[10px_10px_0px_rgba(0,0,0,1)]">
                {rank}
              </div>
            </motion.div>

            <div className="mt-8 text-center space-y-1 relative z-10">
              <h2 className="text-4xl font-black italic text-black tracking-tighter uppercase whitespace-nowrap bg-white px-6 py-2 transform -skew-x-12">
                {username}
              </h2>
              <p className="text-xs font-black text-black/60 uppercase tracking-widest italic pt-2">LEVEL {level} INITIALIZED</p>
            </div>
          </div>

          <div className="flex-1 p-12 bg-black/80 flex flex-col justify-between border-l-8 border-white">
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-4xl font-black italic text-white tracking-tighter uppercase">PLAYER STATUS</h3>
                  <div className="h-2 w-32 bg-secondary-color transform -skew-x-12 mt-1" />
                </div>
                <button 
                  onClick={onRestart}
                  className="button-neon p-4 group"
                >
                  <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {Object.entries(stats).map(([key, val]) => {
                  const Icon = statIcons[key] || Shield;
                  return (
                    <motion.div key={key} variants={itemVariants} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 transform -skew-x-12">
                            <Icon className="w-4 h-4 text-secondary-color" />
                          </div>
                          <span className="text-sm font-black uppercase text-white/70 italic tracking-widest">{key}</span>
                        </div>
                        <span className="text-2xl font-black italic text-white">{val}</span>
                      </div>
                      <div className="h-4 w-full bg-white/5 border-2 border-white/20 transform -skew-x-12 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(val / 20) * 100}%` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full bg-secondary-color"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="pt-12 flex flex-col md:flex-row gap-6">
              <div className="flex-1 p-6 bg-white flex items-center justify-between group cursor-pointer hover:bg-main transition-colors">
                <div className="flex items-center gap-4">
                  <Shield className="w-8 h-8 text-black" />
                  <div className="text-black">
                    <h4 className="text-xs font-black uppercase tracking-widest">RANK ASSIGNED</h4>
                    <p className="text-2xl font-black italic tracking-tighter">E-CLASS HUNTER</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEnterHub}
                className="button-neon flex-1 py-6 text-3xl font-black tracking-widest"
              >
                GO TO TRAINING
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 right-0 w-64 h-32 bg-main transform translate-x-1/2 translate-y-1/2 -rotate-12 opacity-50" />
      <div className="absolute top-0 left-0 w-64 h-32 bg-secondary-color transform -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-50" />
    </div>
  );
};

export default RankAssignment;




