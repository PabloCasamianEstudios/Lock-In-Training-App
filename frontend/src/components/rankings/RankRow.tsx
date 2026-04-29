import { motion } from 'framer-motion';
import { useLanguage } from '../../LanguageContext';
import type { RankingUserDTO } from '../../types';
import Avatar from './Avatar';

const RANK_COLORS: Record<string, string> = {
  S: 'text-yellow-400',
  A: 'text-red-500',
  B: 'text-purple-400',
  C: 'text-blue-400',
  D: 'text-green-400',
  E: 'text-white/40',
};

const rankColor = (rank?: string) => RANK_COLORS[rank ?? 'E'] ?? 'text-white/40';

interface RankRowProps {
  player: RankingUserDTO | null;
  position: number;
  isCurrentUser?: boolean;
  onClick?: () => void;
  showTotalPoints?: boolean;
  showSeasonPoints?: boolean;
}

export default function RankRow({ 
  player, 
  position, 
  isCurrentUser, 
  onClick,
  showTotalPoints = true,
  showSeasonPoints = false
}: RankRowProps) {
  const { t } = useLanguage();
  if (!player) {
    return (
      <div className="flex items-center gap-3 p-3 border-b border-white/10 last:border-0 opacity-50">
        <span className="text-sm font-black italic w-6 text-right flex-shrink-0 text-white/20">{position}</span>
        <div className="w-10 h-10 rounded-full border-2 border-white/10 bg-zinc-900/50" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-white/20 uppercase italic">---</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: position * 0.05 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 border-b border-white/10 last:border-0 transition-colors cursor-pointer
        ${isCurrentUser ? 'bg-main/10 border-l-2 border-l-main' : 'hover:bg-white/5'}`}
    >
      <span className={`text-sm font-black italic w-6 text-right flex-shrink-0 ${isCurrentUser ? 'text-main' : 'text-white/40'}`}>
        {position}
      </span>
      <Avatar src={player.profilePic} username={player.username} size="w-10 h-10" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-white uppercase italic truncate">{player.username}</p>
        <p className="text-[9px] italic text-white/30 truncate">"{player.title || 'Sin título'}"</p>
      </div>
      <div className="text-right flex-shrink-0 flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-2">
          {showTotalPoints && (
            <span className="text-[9px] font-black text-white/40 bg-white/5 px-1.5 py-0.5 border border-white/10">
              TP: {player.totalPoints}
            </span>
          )}
          {showSeasonPoints && (
            <span className="text-[9px] font-black text-main bg-main/5 px-1.5 py-0.5 border border-main/20">
              SP: {player.seasonPoints}
            </span>
          )}
        </div>
        <p className={`text-[10px] font-black uppercase leading-none mt-1 ${rankColor(player.rank)}`}>
          {t('common.rank')} {player.rank}
        </p>
        <p className="text-[9px] text-white/20 font-bold">{t('common.level')}{player.level}</p>
      </div>
    </motion.div>
  );
}
