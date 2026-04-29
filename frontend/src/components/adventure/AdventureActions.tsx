import { FC } from 'react';
import { useLanguage } from '../../LanguageContext';

interface AdventureActionsProps {
  options: string[];
  pendingQuestId: number | null;
  hp: number;
  isActive: boolean;
  loading: boolean;
  onStart: () => void;
  onAction: (choice: string) => void;
  onSkip: () => void;
}

export const AdventureActions: FC<AdventureActionsProps> = ({ 
  options, pendingQuestId, hp, isActive, loading, onStart, onAction, onSkip 
}) => {
  const { t } = useLanguage();

  return (
    <div className="p-8 bg-neutral-black/90 border-t-4 border-neutral-white mt-auto min-h-[140px]">
      {!isActive && hp <= 0 ? (
        <button
          onClick={onStart}
          disabled={loading}
          className="w-full py-6 bg-main hover:bg-neutral-white text-black font-black uppercase tracking-[0.3em] transition-all border-4 border-black hover:-translate-y-2 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed group text-xl italic"
        >
          <span className="inline-block group-hover:scale-110 transition-transform">
            {hp <= 0 ? t('adventure.start_new') : t('adventure.enter_dungeon')}
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingQuestId ? (
            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <div className="text-center border-4 border-red-600 bg-red-600/10 p-6 text-red-600 text-xs font-black uppercase tracking-[0.3em] animate-pulse italic shadow-lg">
                {t('adventure.path_blocked')}
              </div>
              <button
                onClick={onSkip}
                disabled={loading}
                className="py-4 bg-neutral-black hover:bg-main text-text-secondary hover:text-black font-black uppercase tracking-[0.2em] transition-all border-2 border-border hover:border-main text-[10px] italic"
              >
                {t('adventure.override_trial')}
              </button>
            </div>
          ) : options.length > 0 ? (
            options.map((opt, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => onAction(opt)}
                className="p-6 bg-neutral-black border-2 border-border text-text-main hover:bg-main hover:text-black hover:border-main shadow-[6px_6px_0px_var(--main-color)] transition-all font-black uppercase italic tracking-widest text-left disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 active:translate-y-1 active:shadow-none text-xs md:text-sm"
              >
                {opt.replace(/"/g, '')}
              </button>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-main/30 text-xs text-center italic font-black uppercase tracking-[0.4em] animate-pulse py-6">
              {t('adventure.waiting_gm')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
