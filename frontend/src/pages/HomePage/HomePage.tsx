import { useState, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';
import type { PageProps } from '../../types';
import { useHomeData } from '../../hooks/useHomeData';
import PageLayout from '../../components/common/PageLayout';
import { useLanguage } from '../../LanguageContext';

import HomeProfileSidebar from '../../components/home/HomeProfileSidebar';
import HomeTabsNav, { HomeTabType } from '../../components/home/HomeTabsNav';
import FeedTab from '../../components/home/FeedTab';
import ActivityTab from '../../components/home/ActivityTab';
import TipsTab from '../../components/home/TipsTab';
import FriendsTab from '../../components/home/FriendsTab';
import { useFriendActions } from '../../hooks/useFriendActions';

const HomePage: FC<PageProps> = ({ user }) => {
  const { t } = useLanguage();
  const { 
    username,
    profilePic,
    activeQuestsCount, 
    dailyQuests,
    friends, 
    pendingRequests,
    activity, 
    tips,
    streak, 
    level, 
    xp, 
    rank, 
    loading,
    refresh
  } = useHomeData(user?.id);

  const [activeTab, setActiveTab] = useState<HomeTabType>('FEED');

  const {
    searchQuery,
    setSearchQuery,
    searchResult,
    searchStatus,
    isSearching,
    isAdding,
    handleSearch,
    handleAddFriend,
    handleAcceptRequest,
    handleRejectRequest
  } = useFriendActions(user?.id, refresh);

  if (loading) {
    return (
      <PageLayout title={t('home.title')} subtitle={t('home.subtitle_establishing')} icon={Home}>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-main animate-pulse font-black italic uppercase tracking-widest text-xs">
            {t('home.loading')}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={t('home.title')} 
      subtitle={t('home.subtitle_active')} 
      icon={Home}
    >
      <div className="md:grid md:grid-cols-12 md:gap-12 items-start">
        <HomeProfileSidebar 
          profilePic={profilePic}
          username={username}
          level={level}
          rank={rank}
          xp={xp}
          activeQuestsCount={activeQuestsCount}
          streak={streak}
        />

        {/* --- MAIN CONTENT AREA --- */}
        <div className="md:col-span-7 lg:col-span-8 mt-12 md:mt-0">
          <HomeTabsNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* --- TAB CONTENT --- */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'FEED' && <FeedTab dailyQuests={dailyQuests} />}
                {activeTab === 'ACTIVITY' && <ActivityTab activity={activity} />}
                {activeTab === 'TIPS' && <TipsTab tips={tips} />}
                {activeTab === 'FRIENDS' && (
                  <FriendsTab 
                    friends={friends}
                    pendingRequests={pendingRequests}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchResult={searchResult}
                    searchStatus={searchStatus}
                    isSearching={isSearching}
                    isAdding={isAdding}
                    onSearch={() => handleSearch(user?.username)}
                    onAddFriend={handleAddFriend}
                    onAcceptRequest={handleAcceptRequest}
                    onRejectRequest={handleRejectRequest}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HomePage;
