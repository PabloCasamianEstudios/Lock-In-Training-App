import { useState, type FC, useEffect, useMemo } from 'react';
import { Timer, CheckCircle2, Square, CheckSquare, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../LanguageContext';

interface ActiveQuestViewProps {
  activeProgress: any;
  onUpdateProgress: (progressId: number, data: any) => void;
  onComplete: (progressId: number) => void;
  onCancel: (progressId: number) => void;
}

const ActiveQuestView: FC<ActiveQuestViewProps> = ({ activeProgress, onUpdateProgress, onComplete, onCancel }) => {
  const { t } = useLanguage();
  const getInitialState = (key: string, defaultValue: any, isObject = false) => {
    try {
      const item = localStorage.getItem(`quest_${activeProgress.id}_${key}`);
      if (item !== null) {
        return isObject ? JSON.parse(item) : item;
      }
    } catch (e) {
      console.warn("Error reading from localStorage:", e);
    }
    return defaultValue;
  };

  const [hasStarted, setHasStarted] = useState<boolean>(() => getInitialState('started', 'false') === 'true');
  const [startTimestamp, setStartTimestamp] = useState<number | null>(() => {
    const ts = getInitialState('start_ts', null);
    return ts ? parseInt(ts, 10) : null;
  });
  const [seconds, setSeconds] = useState(0);
  const [stepProgress, setStepProgress] = useState<Record<number, number>>(() => getInitialState('steps', {}, true));

  useEffect(() => {
    localStorage.setItem(`quest_${activeProgress.id}_steps`, JSON.stringify(stepProgress));
  }, [stepProgress, activeProgress.id]);

  useEffect(() => {
    if (!hasStarted || !startTimestamp) return;

    setSeconds(Math.floor((Date.now() - startTimestamp) / 1000));
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTimestamp) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, startTimestamp]);

  const handleStart = () => {
    const now = Date.now();
    setStartTimestamp(now);
    setHasStarted(true);
    localStorage.setItem(`quest_${activeProgress.id}_start_ts`, now.toString());
    localStorage.setItem(`quest_${activeProgress.id}_started`, 'true');
  };

  const clearStorageAndAction = (action: (id: number) => void) => {
    localStorage.removeItem(`quest_${activeProgress.id}_started`);
    localStorage.removeItem(`quest_${activeProgress.id}_start_ts`);
    localStorage.removeItem(`quest_${activeProgress.id}_steps`);
    action(activeProgress.id);
  };

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

  const handleIncrement = (index: number, step: any, amount: number) => {
    if (!hasStarted) return;
    const target = getTarget(step);
    setStepProgress(prev => ({
      ...prev,
      [index]: Math.min(target, (prev[index] || 0) + amount)
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
        className="w-full max-w-xl border-[6px] border-neutral-white bg-neutral-black p-4 sm:p-8 shadow-[10px_10px_0px_var(--neutral-white)] sm:shadow-[20px_20px_0px_var(--neutral-white)] relative"
      >
        <button
          onClick={() => clearStorageAndAction(onCancel)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-red-600 text-neutral-black border-2 border-red-500 hover:bg-red-500 hover:text-neutral-black transition-all z-10"
          title={t('quest_view.abort')}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex items-center gap-3 sm:gap-4 mb-2">
          <div className="bg-main p-1.5 sm:p-2 transform -skew-x-12">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-black" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-text-main">{t('quest_view.protocol')}</h1>
        </div>
        <p className="text-main font-black italic uppercase tracking-widest text-[10px] sm:text-xs mb-6 sm:mb-8 border-b-2 border-main pb-2 inline-block">
          {t('quest_view.system_workout')}
        </p>

        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
          {!hasStarted ? (
            <div className="py-8 sm:py-12 flex flex-col items-center justify-center space-y-6 sm:space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-black italic text-text-main uppercase tracking-widest">{t('quest_view.awaiting_init')}</h2>
                <p className="text-text-secondary opacity-40 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">{t('quest_view.prepare')}</p>
              </div>

              <button
                onClick={handleStart}
                className="group relative px-8 py-4 sm:px-12 sm:py-6 bg-main title-hover transition-all"
              >
                <span className="relative z-10 text-xl sm:text-3xl font-black italic text-neutral-black uppercase tracking-tighter">{t('quest_view.start')}</span>
                <div className="absolute inset-0 border-4 border-neutral-white translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full opacity-40 grayscale">
                {steps.map((s: any, i: number) => (
                  <div key={i} className="border-2 border-border p-2 sm:p-3 text-[8px] font-black uppercase italic text-text-main truncate">
                    {s.exercise?.name || 'Exercise'} - {getTarget(s)} REPS
                  </div>
                ))}
              </div>
            </div>
          ) : (
            steps.map((step: any, idx: number) => {
              const target = getTarget(step);
              const progress = currentProgress(idx);
              const isCompleted = progress >= target;

              return (
                <div key={idx} className={`flex flex-col gap-3 group p-3 sm:p-4 border-2 transition-colors ${isCompleted ? 'border-main bg-surface' : 'border-border hover:border-main'}`}>
                  <div className={`flex justify-between items-center border-b-2 pb-2 gap-4 ${isCompleted ? 'border-neutral-black/20' : 'border-border'}`}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {isCompleted ? (
                        <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--neutral-white)] opacity-30 flex-shrink-0" />
                      ) : (
                        <Square className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary opacity-40 flex-shrink-0" />
                      )}
                      <span className={`text-lg sm:text-3xl font-black italic uppercase tracking-tighter leading-none ${isCompleted ? 'text-[var(--neutral-white)] opacity-30' : 'text-text-main'}`}>
                        {step.exercise?.name ?? step.exerciseName ?? 'Exercise'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className={`text-[8px] sm:text-[10px] font-bold uppercase ${isCompleted ? 'text-neutral-black/60' : 'text-text-secondary opacity-40'}`}>{t('quest_view.progress')}</span>
                      <span className={`text-lg sm:text-3xl font-black italic ${isCompleted ? 'text-[var(--neutral-white)] opacity-30' : 'text-text-main'}`}>
                        {progress} <span className={`text-sm sm:text-lg ${isCompleted ? 'text-[var(--neutral-white)] opacity-100' : 'text-text-secondary opacity-100'}`}>/ {target}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1 sm:mt-2">
                    <button
                      onClick={() => handleDecrement(idx)}
                      disabled={isCompleted && progress === target ? false : progress === 0}
                      className={`w-10 sm:w-12 border-2 p-2 sm:p-3 text-lg sm:text-xl font-black italic transition-all
                        ${isCompleted
                          ? 'bg-[var(--neutral-white)]/5 border-[var(--neutral-white)]/10 text-[var(--neutral-white)] opacity-30 hover:bg-red-600 hover:text-white hover:border-red-500 hover:opacity-100'
                          : 'bg-surface border-border text-text-secondary hover:border-red-500 hover:bg-red-600 hover:text-white'}`}
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleIncrement(idx, step, 1)}
                      disabled={isCompleted}
                      className={`flex-1 border-2 p-2 sm:p-3 text-xs sm:text-base font-black italic transition-all
                        ${isCompleted
                          ? 'bg-[var(--neutral-white)]/5 border-[var(--neutral-white)]/10 text-[var(--neutral-white)] opacity-30'
                          : 'bg-surface border-border text-text-secondary hover:border-main hover:bg-main hover:text-neutral-black'}`}
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleIncrement(idx, step, 5)}
                      disabled={isCompleted}
                      className={`flex-1 border-2 p-2 sm:p-3 text-xs sm:text-base font-black italic transition-all
                        ${isCompleted
                          ? 'bg-[var(--neutral-white)]/5 border-[var(--neutral-white)]/10 text-[var(--neutral-white)] opacity-30'
                          : 'bg-surface border-border text-text-secondary hover:border-main hover:bg-main hover:text-neutral-black'}`}
                    >
                      +5
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {hasStarted && (
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="bg-surface p-3 sm:p-4 border-2 border-dashed border-border shadow-inner">
              <div className="flex items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-5xl font-black italic text-text-main tracking-widest">
                <Timer className="w-6 h-6 sm:w-10 sm:h-10 text-main animate-pulse" />
                {formatTime(seconds)}
              </div>
              <p className="text-[9px] sm:text-[10px] text-text-secondary opacity-30 uppercase font-black italic mt-1 sm:mt-2 tracking-widest">
                {t('quest_view.elapsed')}
              </p>
            </div>

            <button
              onClick={() => clearStorageAndAction(onComplete)}
              disabled={!allCompleted}
              className={`w-full font-black py-4 sm:py-5 text-sm sm:text-xl uppercase italic tracking-[0.2em] sm:tracking-[0.3em] transition-all transform flex items-center justify-center gap-3
                ${allCompleted
                  ? 'bg-main text-neutral-black hover:bg-neutral-white hover:scale-[1.01] active:scale-[0.99] shadow-[6px_6px_0px_var(--neutral-white)] sm:shadow-[8px_8px_0px_var(--neutral-white)] cursor-pointer'
                  : 'bg-surface text-text-secondary opacity-30 border-2 border-border cursor-not-allowed'
                }
              `}
            >
              {t('quest_view.complete')}
            </button>
          </div>
        )}

        <div className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-main" />
        <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-main" />
      </motion.div>
    </div>
  );
};

export default ActiveQuestView;





