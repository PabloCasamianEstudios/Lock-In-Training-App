import { FC, RefObject } from 'react';
import { motion } from 'framer-motion';
import { Skull, Swords, Activity } from 'lucide-react';
import BrutalistCard from '../common/BrutalistCard';
import { useLanguage } from '../../LanguageContext';

interface AdventureLogProps {
  contextHistory: string;
  hp: number;
  roomCount: number;
  currentRoomType: string;
  loading: boolean;
  error: string | null;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export const AdventureLog: FC<AdventureLogProps> = ({ 
  contextHistory, hp, roomCount, currentRoomType, loading, error, scrollRef 
}) => {
  const { t } = useLanguage();

  return (
    <BrutalistCard padding="p-0" variant="heavy" className="w-full flex flex-col relative border-4 border-neutral-white overflow-hidden shadow-[16px_16px_0px_var(--main-color)]">
      <div className="p-6 border-b-4 border-neutral-white flex justify-between items-center bg-neutral-black/40 backdrop-blur-md">
        <h2 className="text-main font-black italic tracking-tighter text-3xl flex items-center gap-3 uppercase">
          <Swords className="w-8 h-8" /> {t('adventure.game_master')}
        </h2>
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-text-secondary opacity-40 uppercase font-black tracking-widest">{t('adventure.room')}</span>
            <span className="text-text-main font-black text-2xl tracking-tighter italic leading-none">{roomCount}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-text-secondary opacity-40 uppercase font-black tracking-widest">{t('adventure.type')}</span>
            <span className={`font-black text-2xl tracking-tighter italic leading-none ${
              currentRoomType === 'BOSS' ? 'text-red-600 animate-pulse' :
              currentRoomType === 'COMBATE' ? 'text-orange-500' : 'text-main'
            }`}>
              {currentRoomType || 'UNKNOWN'}
            </span>
          </div>
        </div>
        {loading && <Activity className="w-5 h-5 text-main animate-spin" />}
      </div>

      <div
        ref={scrollRef}
        className="flex-grow p-8 md:p-12 overflow-y-auto text-sm md:text-xl text-text-main/80 leading-relaxed uppercase whitespace-pre-wrap bg-neutral-black font-black tracking-wider no-scrollbar custom-scrollbar"
        style={{ minHeight: '500px', maxHeight: '75vh' }}
      >
        {error && <div className="text-neutral-black mb-6 font-black italic text-xs uppercase tracking-[0.2em] border-4 border-red-600 p-4 bg-red-600 shadow-lg">{error}</div>}

        {!contextHistory ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-20">
            <Skull className="w-20 h-20 text-text-secondary" />
            <div className="text-text-main italic text-center font-black uppercase tracking-[0.4em] text-xs">
              {t('adventure.darkness_awaits')}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {contextHistory.split('\n').map((line, idx) => (
              <p key={idx} className={`${line.startsWith('User chose:') ? 'text-main font-black border-l-4 border-main pl-6 py-2 bg-main/5 text-sm uppercase my-10 tracking-[0.2em] italic' : 'text-text-main/70 drop-shadow-sm'}`}>
                {line}
              </p>
            ))}
            {hp <= 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-red-600 font-black text-6xl text-center py-20 animate-pulse flex flex-col items-center gap-4 tracking-tighter italic"
              >
                <Skull className="w-24 h-24" />
                {t('adventure.you_died')}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </BrutalistCard>
  );
};
