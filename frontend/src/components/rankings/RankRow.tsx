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
}

export default function RankRow({ player, position, isCurrentUser, onClick }: RankRowProps) {
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
        <p className="text-[9px] italic text-white/30 truncate">"{player.title ?? t('common.hunter').toLowerCase()}"</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-xs font-black uppercase ${rankColor(player.rank)}`}>
          {t('common.rank')} {player.rank}
        </p>
        <p className="text-[10px] text-white/30">{t('common.level')}{player.level}</p>
      </div>
    </motion.div>
  );
}
