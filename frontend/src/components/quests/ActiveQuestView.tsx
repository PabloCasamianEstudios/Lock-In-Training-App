import { useState, type FC, useEffect, useMemo } from 'react';
import { Timer, CheckCircle2, Square, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActiveQuestViewProps {
  activeProgress: any;
  onUpdateProgress: (progressId: number, data: any) => void;
  onComplete: (progressId: number) => void;
}

const ActiveQuestView: FC<ActiveQuestViewProps> = ({ activeProgress, onUpdateProgress, onComplete }) => {
  const [seconds, setSeconds] = useState(0);
  const [stepProgress, setStepProgress] = useState<Record<number, number>>({});

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
  const steps: any[] = quest.steps ?? [];

  const getTarget = (step: any) => {
    return (step.series ?? 1) * (step.repetitions || step.duration || 1);
  };

  const currentProgress = (index: number) => stepProgress[index] || 0;

  const handleIncrement = (index: number, step: any) => {
    const target = getTarget(step);
    setStepProgress(prev => ({
      ...prev,
      [index]: Math.min(target, (prev[index] || 0) + 1)
    }));
  };

  const handleDecrement = (index: number) => {
    setStepProgress(prev => ({
      ...prev,
      [index]: Math.max(0, (prev[index] || 0) - 1)
    }));
  };

  const allCompleted = useMemo(() => {
    if (steps.length === 0) return true;
    return steps.every((step, idx) => currentProgress(idx) >= getTarget(step));
  }, [steps, stepProgress]);

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

        <div className="space-y-8 mb-12">
          {steps.map((step: any, idx: number) => {
            const target = getTarget(step);
            const progress = currentProgress(idx);
            const isCompleted = progress >= target;

            return (
              <div key={idx} className={`flex flex-col gap-3 group p-4 border-2 transition-colors ${isCompleted ? 'border-main bg-main/5' : 'border-white/10 hover:border-main/50'}`}>
                <div className="flex justify-between items-center border-b-2 border-white/10 pb-2">
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckSquare className="w-8 h-8 text-main" />
                    ) : (
                      <Square className="w-8 h-8 text-white/40" />
                    )}
                    <span className={`text-2xl sm:text-3xl font-black italic uppercase tracking-tighter ${isCompleted ? 'text-main' : 'text-white'}`}>
                      {step.exercise?.name ?? step.exerciseName ?? 'Exercise'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-white/40 uppercase">Progress</span>
                    <span className={`text-2xl sm:text-3xl font-black italic ${isCompleted ? 'text-main' : 'text-white'}`}>
                      {progress} <span className="text-lg text-white/50">/ {target}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleDecrement(idx)}
                    disabled={isCompleted && progress === target ? false : progress === 0}
                    className="flex-1 bg-white/5 border-2 border-white/20 hover:border-red-500 hover:bg-red-500/10 p-3 text-xl font-black italic transition-all text-white/80 hover:text-red-500 disabled:opacity-30 flex items-center justify-center cursor-pointer shadow-[4px_4px_0px_transparent] hover:shadow-[4px_4px_0px_var(--red-500)] transform hover:-translate-y-1"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => handleIncrement(idx, step)}
                    disabled={isCompleted}
                    className="flex-[2] bg-white/5 border-2 border-white/20 hover:border-main hover:bg-main/10 p-3 text-xl font-black italic transition-all text-white/80 hover:text-main disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:bg-white/5 disabled:hover:text-white/80 disabled:transform-none disabled:shadow-none flex items-center justify-center cursor-pointer shadow-[4px_4px_0px_transparent] hover:shadow-[4px_4px_0px_var(--main-color)] transform hover:-translate-y-1"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
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
            disabled={!allCompleted}
            className={`w-full font-black py-5 text-xl uppercase italic tracking-[0.3em] transition-all transform flex items-center justify-center gap-3
              ${allCompleted 
                ? 'bg-main text-black hover:bg-white hover:scale-[1.02] active:scale-[0.98] shadow-[8px_8px_0px_white] hover:shadow-[8px_8px_0px_var(--main-color)] cursor-pointer' 
                : 'bg-white/10 text-white/30 border-2 border-white/20 cursor-not-allowed'
              }
            `}
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

