import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { PageProps, RankingUserDTO } from '../../types';
import { useRankings } from '../../hooks/useRankings';
import PageLayout from '../../components/common/PageLayout';
import { useLanguage } from '../../LanguageContext';

import RankingsTabsNav from '../../components/rankings/RankingsTabsNav';
import LoadingSkeleton from '../../components/rankings/LoadingSkeleton';
import LeaderboardView from '../../components/rankings/LeaderboardView';
import LeagueView from '../../components/rankings/LeagueView';

const RankingsPage: FC<PageProps> = ({ user, profile, onNavigate }) => {
  const { t } = useLanguage();
  const { globalTop, friends, leaguePlayers, loading, activeTab, setActiveTab } = useRankings(user?.id);
  const currentUserId = user?.id;

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

  const friendsRankDtos: RankingUserDTO[] = sortedFriends.map(f => ({
    ...f,
    totalPoints: f.totalPoints || 0,
    seasonPoints: f.seasonPoints || 0,
    level: f.level || 1,
    rank: f.rank || 'E'
  }));

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
      <RankingsTabsNav activeTab={activeTab as any} setActiveTab={setActiveTab as any} />

      <AnimatePresence mode="wait">
        {activeTab === 'ALL' && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:grid md:grid-cols-12 md:gap-12 items-start"
          >
            <LeaderboardView 
              players={globalTop}
              currentUserId={currentUserId}
              onNavigate={onNavigate}
              titlePrefix={t('rankings.top_hunters').split(' ')[0]}
              titleMain={t('rankings.top_hunters').split(' ')[1]}
              emptyMessage={t('rankings.no_hunters')}
            />
          </motion.div>
        )}

        {activeTab === 'FRIENDS' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:grid md:grid-cols-12 md:gap-12 items-start"
          >
            <LeaderboardView 
              players={friendsRankDtos}
              currentUserId={currentUserId}
              onNavigate={onNavigate}
              titlePrefix={t('rankings.tabs.friends')}
              titleMain="RANK"
              emptyMessage={t('rankings.summon_allies')}
            />
          </motion.div>
        )}

        {activeTab === 'YOUR_LEAGUE' && (
          <motion.div
            key="league"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <LeagueView 
              players={leaguePlayers ?? []}
              currentUserId={currentUserId}
              onNavigate={onNavigate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default RankingsPage;
