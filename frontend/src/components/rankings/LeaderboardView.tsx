import { Star } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import type { RankingUserDTO } from '../../types';
import BrutalistCard from '../common/BrutalistCard';
import EmptyState from './EmptyState';
import PodiumCard from './PodiumCard';
import RankRow from './RankRow';

interface LeaderboardViewProps {
  players: RankingUserDTO[];
  currentUserId?: number;
  onNavigate?: (tab: string, params?: any) => void;
  titlePrefix: string;
  titleMain: string;
  emptyMessage: string;
  maxRows?: number;
  showSeasonPoints?: boolean;
}

export default function LeaderboardView({
  players,
  currentUserId,
  onNavigate,
  titlePrefix,
  titleMain,
  emptyMessage,
  maxRows = 10,
  showSeasonPoints = false
}: LeaderboardViewProps) {
  const { t } = useLanguage();

  if (players.length === 0) {
    return <div className="col-span-full"><EmptyState message={emptyMessage} /></div>;
  }

  const podium = players.slice(0, 3);
  const rows = Array.from({ length: maxRows }, (_, i) => players[i] || null);

  return (
    <>
      <div className="md:col-span-5 lg:col-span-4 mb-12 md:mb-0 md:sticky md:top-4">
        <h2 className="text-center text-4xl font-black italic tracking-tighter text-text-main mb-12 uppercase border-b-2 border-border pb-4">
          {titlePrefix} <span className="text-main">{titleMain}</span>
        </h2>

        <div className="flex items-end justify-around gap-2 mb-12">
          {[1, 0, 2].map(idx => {
            if (!podium[idx]) return <div key={`empty_${idx}`} className="w-1/3" />;
            return (
              <PodiumCard
                key={`podium_${podium[idx].id}_${idx}`}
                player={podium[idx]}
                position={idx as 0 | 1 | 2}
                isCurrentUser={podium[idx].id === currentUserId}
                showSeasonPoints={showSeasonPoints}
              />
            );
          })}
        </div>

        {currentUserId && players.find(p => p.id === currentUserId) && (
          <div className="hidden md:block bg-main/5 border-l-4 border-main p-5 shadow-lg">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-main italic">
              <Star className="w-5 h-5 fill-main" />
              {t('rankings.live_status')}
            </div>
            <p className="text-[9px] text-text-secondary mt-2 font-bold uppercase">{t('rankings.performance_tracked')}</p>
          </div>
        )}
      </div>

      <div className="md:col-span-7 lg:col-span-8">
        <BrutalistCard padding="p-0" className="shadow-[12px_12px_0px_var(--neutral-white)] border-4 border-neutral-white">
          {rows.map((player, i) => (
            <RankRow
              key={player ? player.id : `empty_rank_${i}`}
              player={player}
              position={i + 1}
              isCurrentUser={player?.id === currentUserId}
              showSeasonPoints={showSeasonPoints}
              onClick={() => {
                if (player && onNavigate) {
                  onNavigate('profile', { targetId: player.id });
                }
              }}
            />
          ))}
        </BrutalistCard>
      </div>
    </>
  );
}
