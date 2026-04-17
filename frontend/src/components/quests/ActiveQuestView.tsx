import { useState, type FC, useEffect } from 'react';
import { Timer, CheckCircle2, Trophy, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActiveQuestViewProps {
  activeProgress: any;
  onUpdateProgress: (progressId: number, data: any) => void;
  onComplete: (progressId: number) => void;
}

const ActiveQuestView: FC<ActiveQuestViewProps> = ({ activeProgress, onUpdateProgress, onComplete }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = new Date(activeProgress.startTime).getTime();
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeProgress.startTime]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const quest = activeProgress.quest ?? {};
  // steps may be under quest.steps (Spring JPA serialized) or not present at all
  const steps: any[] = quest.steps ?? [];

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl border-[6px] border-white bg-black p-8 shadow-[20px_20px_0px_white] relative"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-main p-2 transform -skew-x-12">
            <CheckCircle2 className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">QUEST PROTOCOL</h1>
        </div>
        <p className="text-main font-black italic uppercase tracking-widest text-xs mb-8 border-b-2 border-main pb-2 inline-block">
          System-Generated Workout
        </p>

        <div className="space-y-12 mb-12">
          {steps.map((step: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-3 group">
              <div className="flex justify-between items-end border-b-2 border-white/10 pb-1 group-hover:border-main transition-colors">
                <span className="text-3xl font-black italic uppercase text-white tracking-tighter">
                {step.exercise?.name ?? step.exerciseName ?? 'Exercise'}
              </span>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Target</span>
                  <span className="text-2xl font-black italic text-main">{idx === 0 ? '1' : '0'} / {step.repetitions || step.duration}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-white/5 border-2 border-white/20 hover:border-main hover:bg-main/10 p-3 text-xs font-black italic uppercase transition-all text-white/50 hover:text-white shadow-[4px_4px_0px_transparent] hover:shadow-[4px_4px_0px_var(--main-color)] transform hover:-translate-y-1">+1 {step.duration ? 'SEC' : 'REP'}</button>
                <button className="flex-1 bg-white/5 border-2 border-white/20 hover:border-main hover:bg-main/10 p-3 text-xs font-black italic uppercase transition-all text-white/50 hover:text-white shadow-[4px_4px_0px_transparent] hover:shadow-[4px_4px_0px_var(--main-color)] transform hover:-translate-y-1">+5 {step.duration ? 'SEC' : 'REP'}</button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-6">
          <div className="bg-white/5 p-4 border-2 border-dashed border-white/20">
            <div className="flex items-center justify-center gap-4 text-5xl font-black italic text-white tracking-widest">
              <Timer className="w-10 h-10 text-main animate-pulse" />
              {formatTime(seconds)}
            </div>
            <p className="text-[10px] text-white/30 uppercase font-black italic mt-2 tracking-widest">
              MISSION ELAPSED TIME
            </p>
          </div>
          
          <button 
            onClick={() => onComplete(activeProgress.id)}
            className="w-full bg-main text-black font-black py-5 text-xl uppercase italic tracking-[0.3em] hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[8px_8px_0px_white] hover:shadow-[8px_8px_0px_var(--main-color)]"
          >
            COMPLETE ALL TASKS
          </button>
        </div>

        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-main" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-main" />
      </motion.div>
    </div>
  );
};

export default ActiveQuestView;

