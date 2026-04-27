import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Crown, Medal, Star } from 'lucide-react';
import type { PageProps, RankingUserDTO, User } from '../../types';
import { useRankings } from '../../hooks/useRankings';
import PageLayout from '../../components/common/PageLayout';
import BrutalistCard from '../../components/common/BrutalistCard';
import ProgressBar from '../../components/common/ProgressBar';
import { useLanguage } from '../../LanguageContext';

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
const rankGlow = (rank?: string) => RANK_GLOW[rank ?? 'E'] ?? '';

const PODIUM_MEDAL = [
  { icon: Crown, color: 'text-yellow-400', size: 'w-7 h-7', label: '#1' },
  { icon: Medal, color: 'text-zinc-300', size: 'w-6 h-6', label: '#2' },
  { icon: Medal, color: 'text-orange-600', size: 'w-5 h-5', label: '#3' },
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
      <div className={`relative`}>
        <Avatar
          src={player.profilePic}
          username={player.username}
          size={isCenter ? 'w-20 h-20' : 'w-14 h-14'}
          className={`border-2 ${isCurrentUser ? 'border-main' : 'border-white/60'}`}
        />
        {isCurrentUser && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-main flex items-center justify-center text-black text-[8px] font-black border border-black">
            {t('common.you')}
          </span>
        )}
      </div>
      <div className="text-center leading-tight">
        <p className={`text-xs font-black uppercase italic leading-none ${isCenter ? 'text-white' : 'text-white/80'}`}>
          {player.username}
        </p>
        <p className="text-[9px] italic text-white/40 mt-0.5">"{player.title ?? t('common.hunter').toLowerCase()}"</p>
        <p className={`text-[10px] font-black uppercase mt-1 ${rankColor(player.rank)}`}>
          {t('common.rank')} {player.rank} · {t('common.level')}{player.level}
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
};


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

const RankingsPage: FC<PageProps> = ({ user, profile, onNavigate }) => {
  const { t } = useLanguage();
  const { globalTop, friends, leaguePlayers, loading, activeTab, setActiveTab } = useRankings(user?.id);
  const currentUserId = user?.id;

  const SUB_TABS = [
    { id: 'ALL' as const, label: t('rankings.tabs.all') },
    { id: 'FRIENDS' as const, label: t('rankings.tabs.friends') },
    { id: 'YOUR_LEAGUE' as const, label: t('rankings.tabs.league') },
  ];

  const currentUserAsUser: any = user && profile ? {
    ...user,
    ...profile,
    id: user.id,
    totalPoints: (profile as any).totalPoints || 0,
    seasonPoints: (profile as any).seasonPoints || 0,
  } : null;

  const friendsWithMe = currentUserAsUser ? [...friends.filter(f => f.id !== user?.id), currentUserAsUser] : friends;
  const sortedFriends = [...friendsWithMe].sort((a, b) => {
    const pointsA = a.totalPoints || 0;
    const pointsB = b.totalPoints || 0;
    return pointsB - pointsA;
  });

  const podium = globalTop.slice(0, 3);

  const top10 = Array.from({ length: 10 }, (_, i) => globalTop[i] || null);

  if (loading) {
    return (
      <PageLayout title={t('rankings.title')} subtitle={t('rankings.subtitle_fetching')} icon={Trophy}>
        <LoadingSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={t('rankings.title')} 
      subtitle={t('rankings.subtitle_hierarchy')} 
      icon={Trophy}
    >
      {/* Sub-tab nav */}
      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-8 border-b border-white/10 mb-10">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 text-[10px] font-black border-2 transition-all uppercase tracking-[0.2em] whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-main text-black border-main shadow-[4px_4px_0px_white]'
                : 'bg-black text-white/40 border-white/20 hover:border-white/40'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        {/* ALL tab */}
        {activeTab === 'ALL' && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:grid md:grid-cols-12 md:gap-12 items-start"
          >
            {globalTop.length === 0 ? (
              <div className="col-span-full"><EmptyState message={t('rankings.no_hunters')} /></div>
            ) : (
              <>
                {/* Podium Side */}
                <div className="md:col-span-5 lg:col-span-4 mb-12 md:mb-0 md:sticky md:top-4">
                  <h2 className="text-center text-4xl font-black italic tracking-tighter text-white mb-12 uppercase border-b-2 border-white/5 pb-4">
                    {t('rankings.top_hunters').split(' ')[0]} <span className="text-main">{t('rankings.top_hunters').split(' ')[1]}</span>
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
                        />
                      );
                    })}
                  </div>

                  {currentUserId && globalTop.find(p => p.id === currentUserId) && (
                    <div className="hidden md:block bg-main/5 border-l-4 border-main p-5 shadow-lg">
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-main italic">
                        <Star className="w-5 h-5 fill-main" />
                        {t('rankings.live_status')}
                      </div>
                      <p className="text-[9px] text-white/40 mt-2 font-bold uppercase">{t('rankings.performance_tracked')}</p>
                    </div>
                  )}
                </div>

                {/* Leaderboard Side */}
                <div className="md:col-span-7 lg:col-span-8">
                  <BrutalistCard padding="p-0" className="shadow-[12px_12px_0px_white] border-4 border-white">
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
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* FRIENDS tab */}
        {activeTab === 'FRIENDS' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:grid md:grid-cols-12 md:gap-12 items-start"
          >
            {friends.length === 0 ? (
              <div className="col-span-full"><EmptyState message={t('rankings.summon_allies')} /></div>
            ) : (
              <>
                {/* Podium Side */}
                <div className="md:col-span-5 lg:col-span-4 mb-12 md:mb-0 md:sticky md:top-4">
                  <h2 className="text-center text-4xl font-black italic tracking-tighter text-white mb-12 uppercase border-b-2 border-white/5 pb-4">
                    {t('rankings.tabs.friends')} <span className="text-main">RANK</span>
                  </h2>

                  <div className="flex items-end justify-around gap-2 mb-12">
                    {[1, 0, 2].map(idx => {
                      const friendPodium = sortedFriends.slice(0, 3);
                      if (!friendPodium[idx]) return <div key={`empty_friend_${idx}`} className="w-1/3" />;
                      
                      const playerDto: RankingUserDTO = {
                        ...friendPodium[idx],
                        totalPoints: friendPodium[idx].totalPoints || 0,
                        seasonPoints: friendPodium[idx].seasonPoints || 0,
                        level: friendPodium[idx].level || 1,
                        rank: friendPodium[idx].rank || 'E'
                      };

                      return (
                        <PodiumCard
                          key={`friend_podium_${playerDto.id}_${idx}`}
                          player={playerDto}
                          position={idx as 0 | 1 | 2}
                          isCurrentUser={playerDto.id === currentUserId}
                        />
                      );
                    })}
                  </div>

                  <div className="hidden md:block bg-main/5 border-l-4 border-main p-5 shadow-lg">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-main italic">
                      <Star className="w-5 h-5 fill-main" />
                      {t('rankings.live_status')}
                    </div>
                    <p className="text-[9px] text-white/40 mt-2 font-bold uppercase">{t('rankings.performance_tracked')}</p>
                  </div>
                </div>

                {/* Leaderboard Side */}
                <div className="md:col-span-7 lg:col-span-8">
                  <BrutalistCard padding="p-0" className="shadow-[12px_12px_0px_white] border-4 border-white">
                    {sortedFriends.slice(0, 10).map((friend, i) => {
                      const playerDto: RankingUserDTO = {
                        ...friend,
                        totalPoints: friend.totalPoints || 0,
                        seasonPoints: friend.seasonPoints || 0,
                        level: friend.level || 1,
                        rank: friend.rank || 'E'
                      };
                      return (
                        <RankRow
                          key={playerDto.id}
                          player={playerDto}
                          position={i + 1}
                          isCurrentUser={playerDto.id === currentUserId}
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate('profile', { targetId: playerDto.id });
                            }
                          }}
                        />
                      );
                    })}
                  </BrutalistCard>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* YOUR_LEAGUE tab */}
        {activeTab === 'YOUR_LEAGUE' && (
          <motion.div
            key="league"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {(leaguePlayers?.length ?? 0) === 0 ? (
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
            ) : (
              <div className="grid md:grid-cols-2 gap-10">
                 <BrutalistCard padding="p-0" className="h-fit shadow-[8px_8px_0px_white] border-4 border-white">
                  <div className="p-4 border-b-2 border-white bg-main/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-main italic">
                      {t('rankings.league_protocol')}
                    </p>
                  </div>
                  {leaguePlayers.slice(0, Math.ceil(leaguePlayers.length / 2)).map((player, i) => (
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
                {leaguePlayers.length > 1 && (
                  <BrutalistCard padding="p-0" className="h-fit shadow-[8px_8px_0px_white] border-4 border-white">
                    <div className="p-4 border-b-2 border-white bg-main/10 md:hidden"></div>
                    {leaguePlayers.slice(Math.ceil(leaguePlayers.length / 2)).map((player, i) => (
                      <RankRow
                        key={player.id}
                        player={player}
                        position={Math.ceil(leaguePlayers.length / 2) + i + 1}
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default RankingsPage;
