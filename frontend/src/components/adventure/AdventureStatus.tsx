import { FC } from 'react';
import { Heart } from 'lucide-react';
import BrutalistCard from '../common/BrutalistCard';
import ProgressBar from '../common/ProgressBar';
import { useLanguage } from '../../LanguageContext';

interface AdventureStatusProps {
  hp: number;
  maxHp: number;
  level: number;
  league?: string | null;
  onReset?: () => void;
  isActive?: boolean;
}

export const AdventureStatus: FC<AdventureStatusProps> = ({ 
  hp, maxHp, level, league, onReset, isActive 
}) => {
  const { t } = useLanguage();

  return (
    <BrutalistCard padding="p-6" className="flex flex-col gap-4 border-4 border-neutral-white shadow-[8px_8px_0px_var(--main-color)]">
      <div className="flex items-center justify-between border-b-2 border-border pb-3">
        <h2 className="text-text-main font-black text-2xl italic uppercase tracking-tighter">{t('adventure.status')}</h2>
        <div className="flex flex-col items-end">
          <div className="text-main font-black text-xl italic leading-none">LVL {level}</div>
          {league && (
            <div className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black mt-1 italic">{league} LEAGUE</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <ProgressBar
          progress={hp}
          max={maxHp}
          color={hp <= 25 ? 'bg-red-600' : 'bg-green-500'}
          height="h-5"
          label={
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-[10px] font-black uppercase italic tracking-widest text-text-secondary">{t('adventure.vitality')}</span>
            </div>
          }
          valueLabel={`${hp} / ${maxHp}`}
        />

        {isActive && onReset && (
          <button
            onClick={onReset}
            className="w-full mt-2 py-3 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-black font-black uppercase tracking-[0.2em] transition-all border-2 border-red-600/50 hover:border-red-600 text-[10px] italic shadow-[4px_4px_0px_rgba(220,38,38,0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
          >
            {t('adventure.restart_campaign')}
          </button>
        )}
      </div>
    </BrutalistCard>
  );
};
