import { FC } from 'react';
import { BarChart2 } from 'lucide-react';
import BrutalistCard from '../common/BrutalistCard';
import { useLanguage } from '../../LanguageContext';

interface AdventureStatsProps {
  stats: Record<string, number>;
  recStats: Record<string, number>;
}

export const AdventureStats: FC<AdventureStatsProps> = ({ stats, recStats }) => {
  const { t } = useLanguage();

  return (
    <BrutalistCard padding="p-6" className="flex flex-col gap-4 border-4 border-neutral-white shadow-[8px_8px_0px_var(--main-color)]" variant="white">
      <h2 className="text-text-main font-black text-lg italic uppercase border-b border-border pb-3 flex items-center gap-3 tracking-widest">
        <BarChart2 className="w-5 h-5 text-orange-500" /> {t('adventure.attributes')}
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {Object.keys(stats).length > 0 ? Object.entries(stats).map(([k, v]) => {
          const recommended = recStats[k] || recStats[k.toLowerCase()] || 0;
          const isAdequate = v >= recommended;

          return (
            <div key={k} className={`flex justify-between items-center p-4 bg-neutral-black border-2 transition-all group ${
              recommended > 0 ? (isAdequate ? 'border-green-500/30 hover:border-green-500' : 'border-red-600 animate-pulse') : 'border-border hover:border-main/50'
            } shadow-md`}>
              <div className="flex flex-col">
                <span className="text-text-secondary opacity-40 uppercase font-black italic text-[9px] tracking-[0.2em]">{k}</span>
                <span className="text-text-main font-black text-lg italic leading-none mt-1 group-hover:text-main transition-colors">{v}</span>
              </div>
              {recommended > 0 && (
                <div className="text-right">
                  <div className="text-[8px] text-text-secondary opacity-20 uppercase font-black tracking-widest">REQ</div>
                  <div className={`font-black text-lg italic ${isAdequate ? 'text-green-500' : 'text-red-600'}`}>{recommended}</div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="col-span-2 py-8 text-center text-[10px] text-main/30 italic uppercase font-black tracking-[0.3em] animate-pulse">{t('adventure.streaming')}</div>
        )}
      </div>
    </BrutalistCard>
  );
};
