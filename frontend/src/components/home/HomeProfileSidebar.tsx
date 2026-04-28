import { Users, Shield, Trophy, Flame } from 'lucide-react';
import BrutalistCard from '../common/BrutalistCard';
import ProgressBar from '../common/ProgressBar';
import { useLanguage } from '../../LanguageContext';

interface HomeProfileSidebarProps {
  profilePic?: string | null;
  username: string;
  level: number;
  rank: string;
  xp: number;
  activeQuestsCount: number;
  streak: number;
}

export default function HomeProfileSidebar({
  profilePic,
  username,
  level,
  rank,
  xp,
  activeQuestsCount,
  streak
}: HomeProfileSidebarProps) {
  const { t } = useLanguage();

  return (
    <div className="md:col-span-5 lg:col-span-4 space-y-8 md:sticky md:top-4">
      <BrutalistCard padding="p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-sm border-2 border-white flex items-center justify-center bg-zinc-900 overflow-hidden shadow-[4px_4px_0px_var(--main-color)] transform -rotate-3 transition-transform hover:rotate-0">
            {profilePic ? (
              <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-10 h-10 text-white/20" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{username}</h2>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-main uppercase italic">{t('common.level')} {level}</span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">{t('common.rank')} {rank}</span>
            </div>
            {(() => {
              const maxXP = Math.floor(1000 * Math.pow(1.5, level - 1));
              return (
                <div className="space-y-1">
                  <ProgressBar progress={xp} max={maxXP} className="h-1.5 mt-2" />
                  <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase tracking-tighter">
                    <span>{xp} XP</span>
                    <span>{maxXP} XP</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </BrutalistCard>

      <BrutalistCard variant="accent" padding="p-0" className="grid grid-cols-3 overflow-hidden shadow-[8px_8px_0px_white]">
        <div className="flex flex-col items-center justify-center p-5 border-r-2 border-white group hover:bg-main/5 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-black italic text-white leading-none tracking-tighter">
              {activeQuestsCount}/1
            </span>
            <Shield className="w-4 h-4 text-main fill-main" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">{t('home.quests')}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-5 border-r-2 border-white group hover:bg-main/5 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-main" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap italic">{t('common.rank')} {rank}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-5 group hover:bg-main/5 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-black italic text-white leading-none tracking-tighter">
              {streak}
            </span>
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">{t('home.streak')}</span>
        </div>
      </BrutalistCard>
    </div>
  );
}
