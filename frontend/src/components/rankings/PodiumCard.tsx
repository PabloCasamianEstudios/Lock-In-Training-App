import { motion } from 'framer-motion';
import { Crown, Medal } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import type { RankingUserDTO } from '../../types';
import Avatar from './Avatar';

const PODIUM_MEDAL = [
  { icon: Crown, color: 'text-yellow-400', size: 'w-7 h-7', label: '#1' },
  { icon: Medal, color: 'text-zinc-300', size: 'w-6 h-6', label: '#2' },
  { icon: Medal, color: 'text-orange-600', size: 'w-5 h-5', label: '#3' },
];

const RANK_COLORS: Record<string, string> = {
  S: 'text-yellow-400',
  A: 'text-red-500',
  B: 'text-purple-400',
  C: 'text-blue-400',
  D: 'text-green-400',
  E: 'text-text-secondary',
};

const rankColor = (rank?: string) => RANK_COLORS[rank ?? 'E'] ?? 'text-text-secondary';

interface PodiumCardProps {
  player: RankingUserDTO;
  position: 0 | 1 | 2;
  isCurrentUser?: boolean;
  showSeasonPoints?: boolean;
}

export default function PodiumCard({ 
  player, 
  position, 
  isCurrentUser,
  showSeasonPoints = false 
}: PodiumCardProps) {
  const { t } = useLanguage();
  const medal = PODIUM_MEDAL[position];
  const MedalIcon = medal.icon;
  const isCenter = position === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.1 }}
      className={`flex flex-col items-center gap-2 ${isCenter ? 'scale-110 z-10' : 'opacity-85'}`}
    >
      <MedalIcon className={`${medal.size} ${medal.color}`} />
      <div className="relative">
        <Avatar
          src={player.profilePic}
          username={player.username}
          size={isCenter ? 'w-20 h-20' : 'w-14 h-14'}
          className={`border-2 ${isCurrentUser ? 'border-main' : 'border-border'}`}
        />
        {isCurrentUser && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-main flex items-center justify-center text-black text-[8px] font-black border border-black">
            {t('common.you')}
          </span>
        )}
      </div>
      <div className="text-center leading-tight">
        <p className={`text-xs font-black uppercase italic leading-none ${isCenter ? 'text-text-main' : 'text-text-main/80'}`}>
          {player.username}
        </p>
        <p className="text-[9px] italic text-text-secondary mt-0.5">"{player.title || 'Sin título'}"</p>
        <div className="flex flex-col items-center gap-0.5 mt-1">
          <div className="flex gap-1.5">
            <span className="text-[8px] font-black text-text-secondary">TP: {player.totalPoints}</span>
            {showSeasonPoints && <span className="text-[8px] font-black text-main">SP: {player.seasonPoints}</span>}
          </div>
          <p className={`text-[9px] font-black uppercase ${rankColor(player.rank)}`}>
            {t('common.rank')} {player.rank} · {t('common.level')}{player.level}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
