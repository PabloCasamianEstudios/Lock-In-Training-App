import { Trophy } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import type { RankingUserDTO } from '../../types';
import BrutalistCard from '../common/BrutalistCard';
import RankRow from './RankRow';

interface LeagueViewProps {
  players: RankingUserDTO[];
  currentUserId?: number;
  onNavigate?: (tab: string, params?: any) => void;
}

export default function LeagueView({ players, currentUserId, onNavigate }: LeagueViewProps) {
  const { t } = useLanguage();

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8 text-center border-4 border-dashed border-white/10 rounded-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-main/10 blur-3xl" />
          <Trophy className="w-16 h-16 text-main/20 relative" />
        </div>
        <div className="border-4 border-white p-8 bg-black space-y-3 shadow-[12px_12px_0px_var(--main-color)] transform -rotate-2">
          <p className="text-3xl font-black italic uppercase text-white tracking-tighter">{t('rankings.season_active').split(' ')[0]}</p>
          <p className="text-6xl font-black italic text-main tracking-tighter leading-none">{t('rankings.season_active').split(' ')[1]}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-4 italic">
            {t('rankings.syncing_group')}
          </p>
        </div>
      </div>
    );
  }

  const half = Math.ceil(players.length / 2);
  const leftCol = players.slice(0, half);
  const rightCol = players.slice(half);

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <BrutalistCard padding="p-0" className="h-fit shadow-[8px_8px_0px_white] border-4 border-white">
        <div className="p-4 border-b-2 border-white bg-main/10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-main italic">
            {t('rankings.league_protocol')}
          </p>
        </div>
        {leftCol.map((player, i) => (
          <RankRow
            key={player.id}
            player={player}
            position={i + 1}
            isCurrentUser={player.id === currentUserId}
            onClick={() => {
              if (onNavigate) {
                onNavigate('profile', { targetId: player.id });
              }
            }}
          />
        ))}
      </BrutalistCard>
      
      {rightCol.length > 0 && (
        <BrutalistCard padding="p-0" className="h-fit shadow-[8px_8px_0px_white] border-4 border-white">
          <div className="p-4 border-b-2 border-white bg-main/10 md:hidden"></div>
          {rightCol.map((player, i) => (
            <RankRow
              key={player.id}
              player={player}
              position={half + i + 1}
              isCurrentUser={player.id === currentUserId}
              onClick={() => {
                if (onNavigate) {
                  onNavigate('profile', { targetId: player.id });
                }
              }}
            />
          ))}
        </BrutalistCard>
      )}
    </div>
  );
}
