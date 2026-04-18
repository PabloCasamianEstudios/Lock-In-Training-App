import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Crown, Medal, Star } from 'lucide-react';
import type { PageProps, RankingUserDTO, User } from '../types';
import { useRankings } from '../hooks/useRankings';
import AppHeader from '../components/common/AppHeader';
import BrutalistCard from '../components/common/BrutalistCard';
import ProgressBar from '../components/common/ProgressBar';

const RANK_COLORS: Record<string, string> = {
  S: 'text-yellow-400',
  A: 'text-red-500',
  B: 'text-purple-400',
  C: 'text-blue-400',
  D: 'text-green-400',
  E: 'text-white/40',
};

const RANK_GLOW: Record<string, string> = {
  S: 'shadow-[0_0_20px_rgba(250,204,21,0.4)]',
  A: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
  B: 'shadow-[0_0_20px_rgba(192,132,252,0.3)]',
  C: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
  D: 'shadow-[0_0_20px_rgba(74,222,128,0.2)]',
  E: '',
};

const rankColor = (rank?: string) => RANK_COLORS[rank ?? 'E'] ?? 'text-white/40';
const rankGlow  = (rank?: string) => RANK_GLOW[rank ?? 'E'] ?? '';

const PODIUM_MEDAL = [
  { icon: Crown,  color: 'text-yellow-400', size: 'w-7 h-7', label: '#1' },
  { icon: Medal,  color: 'text-zinc-300',   size: 'w-6 h-6', label: '#2' },
  { icon: Medal,  color: 'text-orange-600', size: 'w-5 h-5', label: '#3' },
];

interface AvatarProps {
  src?: string;
  username: string;
  size?: string;
  className?: string;
}
const Avatar: FC<AvatarProps> = ({ src, username, size = 'w-14 h-14', className = '' }) => (
  <div className={`${size} rounded-full border-2 border-white bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}>
    {src
      ? <img src={src} alt={username} className="w-full h-full object-cover" />
      : <Users className="w-1/2 h-1/2 text-white/30" />}
  </div>
);

interface PodiumCardProps {
  player: RankingUserDTO;
  position: 0 | 1 | 2;
  isCurrentUser?: boolean;
}
const PodiumCard: FC<PodiumCardProps> = ({ player, position, isCurrentUser }) => {
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
      <div className={`relative ${rankGlow(player.seasonRank)}`}>
        <Avatar
          src={player.profilePic}
          username={player.username}
          size={isCenter ? 'w-20 h-20' : 'w-14 h-14'}
          className={`border-2 ${isCurrentUser ? 'border-main' : 'border-white/60'}`}
        />
        {isCurrentUser && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-main flex items-center justify-center text-black text-[8px] font-black border border-black">
            YOU
          </span>
        )}
      </div>
      <div className="text-center leading-tight">
        <p className={`text-xs font-black uppercase italic leading-none ${isCenter ? 'text-white' : 'text-white/80'}`}>
          {player.username}
        </p>
        <p className="text-[9px] italic text-white/40 mt-0.5">"{player.title ?? 'the hunter'}"</p>
        <p className={`text-[10px] font-black uppercase mt-1 ${rankColor(player.seasonRank)}`}>
          RANK {player.seasonRank} · lv.{player.level}
        </p>
      </div>
    </motion.div>
  );
};


interface RankRowProps {
  player: RankingUserDTO | null;
  position: number;
  isCurrentUser?: boolean;
  onClick?: () => void;
}
const RankRow: FC<RankRowProps> = ({ player, position, isCurrentUser, onClick }) => {
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
        <p className="text-[9px] italic text-white/30 truncate">"{player.title ?? 'the hunter'}"</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-xs font-black uppercase ${rankColor(player.seasonRank)}`}>
          RANK {player.seasonRank}
        </p>
        <p className="text-[10px] text-white/30">lv.{player.level}</p>
      </div>
    </motion.div>
  );
};

interface FriendRowProps {
  friend: User;
  position: number;
}
const FriendRow: FC<FriendRowProps> = ({ friend, position }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: position * 0.07 }}
    className="flex items-center gap-3 p-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors"
  >
    <span className="text-sm font-black italic w-6 text-right flex-shrink-0 text-white/40">{position}</span>
    <div className="w-10 h-10 rounded-full border border-white/20 bg-zinc-800 flex items-center justify-center text-xs font-black text-white/50 flex-shrink-0">
      {friend.username[0].toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-black text-white uppercase italic truncate">{friend.username}</p>
      <ProgressBar
        progress={friend.xp % 1000}
        max={1000}
        height="h-1"
        className="mt-1 max-w-[120px]"
      />
    </div>
    <div className="text-right flex-shrink-0">
      <p className={`text-xs font-black uppercase ${rankColor(friend.seasonRank)}`}>
        RANK {friend.seasonRank || 'E'}
      </p>
      <p className="text-[10px] text-white/30">lv.{friend.level}</p>
    </div>
  </motion.div>
);

const EmptyState: FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div className="relative">
      <div className="absolute inset-0 bg-main/10 blur-2xl" />
      <Trophy className="w-12 h-12 text-white/10 relative" />
    </div>
    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20 italic">{message}</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="flex justify-around pt-4 pb-8">
      {[1, 0, 2].map(i => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className={`rounded-full bg-white/10 ${i === 0 ? 'w-20 h-20' : 'w-14 h-14'}`} />
          <div className="w-16 h-2 bg-white/10 rounded" />
          <div className="w-12 h-2 bg-white/10 rounded" />
        </div>
      ))}
    </div>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <div className="w-6 h-4 bg-white/10 rounded" />
        <div className="w-10 h-10 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/10 rounded w-24" />
          <div className="h-2 bg-white/10 rounded w-16" />
        </div>
        <div className="w-12 h-4 bg-white/10 rounded" />
      </div>
    ))}
  </div>
);

const RankingsPage: FC<PageProps> = ({ user, onNavigate }) => {
  const { globalTop, friends, loading, activeTab, setActiveTab } = useRankings(user?.id);
  const currentUserId = user?.id;

  const SUB_TABS = [
    { id: 'ALL' as const,         label: 'ALL' },
    { id: 'FRIENDS' as const,     label: 'FRIENDS' },
    { id: 'YOUR_LEAGUE' as const, label: 'YOUR LEAGUE' },
  ];

  const sortedFriends = [...friends].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));

  const podium  = globalTop.slice(0, 3);
  
  const top10 = Array.from({ length: 10 }, (_, i) => globalTop[i] || null);

  return (
    <div className="max-w-md mx-auto pb-24">
      <AppHeader title="RANKINGS" />

      {/* Sub-tab nav */}
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar px-4 py-3 border-b border-white/10 mb-4">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-[10px] font-black border-2 transition-all uppercase tracking-widest whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-main text-black border-main'
                : 'bg-black text-white/40 border-white/20 hover:border-white/40'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        {/* ── ALL tab ── */}
        {activeTab === 'ALL' && (
          <motion.div
            key="all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <LoadingSkeleton />
            ) : globalTop.length === 0 ? (
              <EmptyState message="No hunters ranked yet" />
            ) : (
              <>
                {/* Podium */}
                <div className="px-4 mb-6">
                  <h2 className="text-center text-4xl font-black italic tracking-tighter text-white mb-6 uppercase">
                    Top Players
                  </h2>

                  {/* reorder: 2nd | 1st | 3rd */}
                  <div className="flex items-end justify-around gap-2">
                    {[1, 0, 2].map(idx => {
                      if (!podium[idx]) return <div key={`empty_${idx}`} className="w-1/3" />;
                      return (
                        <PodiumCard
                          key={`podium_${podium[idx].id}_${idx}`}
                          player={podium[idx]}
                          position={idx as 0 | 1 | 2}
                          isCurrentUser={podium[idx].id === currentUserId}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Rest of leaderboard */}
                <BrutalistCard padding="p-0">
                  {top10.map((player, i) => (
                    <RankRow
                      key={player ? player.id : `empty_rank_${i}`}
                      player={player}
                      position={i + 1}
                      isCurrentUser={player?.id === currentUserId}
                      onClick={() => {
                        if (player && onNavigate) {
                          onNavigate('profile', { targetId: player.id });
                        }
                      }}
                    />
                  ))}
                </BrutalistCard>

                {/* Current user stats if they have points */}
                {currentUserId && globalTop.find(p => p.id === currentUserId) && (
                  <div className="mt-4 px-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 italic">
                      <Star className="w-3 h-3 text-main" />
                      You are in this ranking
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── FRIENDS tab ── */}
        {activeTab === 'FRIENDS' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            {loading ? (
              <LoadingSkeleton />
            ) : sortedFriends.length === 0 ? (
              <EmptyState message="Summon your allies to see them here" />
            ) : (
              <BrutalistCard padding="p-0">
                <div className="p-3 border-b border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                    {sortedFriends.length} {sortedFriends.length === 1 ? 'hunter' : 'hunters'} in your circle
                  </p>
                </div>
                {sortedFriends.map((friend, i) => (
                  <FriendRow key={friend.id} friend={friend} position={i + 1} />
                ))}
              </BrutalistCard>
            )}
          </motion.div>
        )}

        {/* ── YOUR LEAGUE tab ── */}
        {activeTab === 'YOUR_LEAGUE' && (
          <motion.div
            key="league"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-main/10 blur-3xl" />
                <Trophy className="w-12 h-12 text-main/30 relative" />
              </div>
              <div className="border-2 border-white/10 p-6 bg-black space-y-2 shadow-[6px_6px_0px_var(--main-color)]">
                <p className="text-2xl font-black italic uppercase text-white">SEASON</p>
                <p className="text-5xl font-black italic text-main tracking-tighter leading-none">ACTIVE</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-2">
                  Compete to climb the league
                </p>
              </div>
              <p className="text-xs text-white/20 font-black italic uppercase tracking-widest">
                League assignments are updated monthly
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RankingsPage;
