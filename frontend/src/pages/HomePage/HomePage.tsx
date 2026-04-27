import { useState, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Trophy, 
  Flame, 
  ChevronRight, 
  Users, 
  Lightbulb, 
  Activity as ActivityIcon,
  X,
  Check,
  Home
} from 'lucide-react';
import { socialService } from '../../services/socialService';
import { userService } from '../../services/userService';
import type { PageProps } from '../../types';
import { useHomeData } from '../../hooks/useHomeData';
import PageLayout from '../../components/common/PageLayout';
import BrutalistCard from '../../components/common/BrutalistCard';
import ProgressBar from '../../components/common/ProgressBar';
import { useLanguage } from '../../LanguageContext';

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

  const [activeTab, setActiveTab] = useState<'FEED' | 'ACTIVITY' | 'TIPS' | 'FRIENDS'>('FEED');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchStatus, setSearchStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF' | 'NOT_FOUND' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.id) return;
    if (searchQuery.toLowerCase() === user.username.toLowerCase()) {
      setSearchStatus('SELF');
      setSearchResult(user);
      return;
    }

    setIsSearching(true);
    setSearchResult(null);
    setSearchStatus(null);
    try {
      const foundUser = await userService.getUserByUsername(searchQuery);
      if (foundUser) {
        setSearchResult(foundUser);
        const statusData = await socialService.getFriendshipStatus(user.id, foundUser.id);
        setSearchStatus(statusData.status);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResult(null);
      setSearchStatus('NOT_FOUND');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (targetId: number) => {
    if (!user?.id) return;
    setIsAdding(true);
    try {
      await socialService.sendFriendRequest(user.id, targetId);
      setSearchStatus('PENDING');
      refresh();
    } catch (err) {
      console.error('Failed to send request:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await socialService.acceptFriendRequest(requestId);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await socialService.rejectFriendRequest(requestId);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

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
        {/* --- PROFILE SIDEBAR --- */}
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
                  <span className="text-[10px] font-black text-main uppercase italic">{t('common.level')}{level}</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">{t('common.rank')} {rank}</span>
                </div>
                <ProgressBar progress={xp % 1000} max={1000} className="h-1.5 mt-2" />
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

        {/* --- MAIN CONTENT AREA --- */}
        <div className="md:col-span-7 lg:col-span-8 mt-12 md:mt-0">
          {/* --- TABS --- */}
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6 md:mb-4">
            {(['FEED', 'ACTIVITY', 'TIPS', 'FRIENDS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-[10px] font-black border-2 transition-all uppercase tracking-[0.2em] whitespace-nowrap
                  ${activeTab === tab 
                    ? 'bg-main text-black border-main shadow-[4px_4px_0px_white]' 
                    : 'bg-black text-white/40 border-white/10 hover:border-white/40'}`}
              >
                {t(`home.tabs.${tab.toLowerCase()}`)}
              </button>
            ))}
          </nav>

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
                {activeTab === 'FEED' && (
                  <div className="space-y-6">
                    {dailyQuests.filter(q => !q.completed).map((quest, i) => (
                      <div key={quest.id || i} className="bg-black border-4 border-white p-8 relative overflow-hidden shadow-[12px_12px_0px_white] group hover:border-main transition-all hover:-translate-y-1">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-main/5 text-main/5 rounded-full blur-3xl group-hover:bg-main/20 transition-all" />
                        <div className="relative z-10">
                          <h3 className="text-4xl font-black italic tracking-tighter text-white leading-none mb-3 uppercase group-hover:text-main transition-colors">{quest.title}</h3>
                          <p className="text-xs text-white/60 leading-relaxed italic uppercase font-bold mb-8 border-l-2 border-white/20 pl-4">
                            {quest.description || 'System-assigned daily protocol'}
                          </p>
                          <div className="flex justify-between items-end">
                            <div className="flex gap-6">
                              <span className="text-[10px] font-black text-main tracking-[0.2em] italic flex items-center gap-2 bg-main/10 px-3 py-1 rounded-sm border border-main/20">
                                <Flame className="w-4 h-4" />
                                EXP +{quest.xpReward}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="block text-[8px] font-black text-white/20 uppercase mb-1">PROGRESION</span>
                              <span className="text-[12px] font-black text-white italic tracking-widest">{quest.completedRepetitions || 0} / {quest.totalRepetitions || 1} REPS</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {dailyQuests.filter(q => !q.completed).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 border-4 border-dashed border-white/10 rounded-sm">
                        <Check className="w-12 h-12 text-main opacity-20" />
                        <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em] italic">{t('home.no_pending')}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'ACTIVITY' && (
                  <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                    {activity.length > 0 ? (activity.slice(0, 10).map((act, i) => (
                      <div key={i} className="bg-black/40 border-2 border-white/5 p-5 flex items-center justify-between group hover:border-main/40 transition-all hover:bg-black/60">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 rounded-sm group-hover:bg-main/10 transition-colors">
                            <ActivityIcon className="w-5 h-5 text-white/20 group-hover:text-main transition-colors" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white uppercase italic tracking-wider">{act.title ?? 'Quest'}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-1">
                              {act.completionTime ? new Date(act.completionTime).toLocaleDateString() : 'In progress'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-main italic">+{act.xpReward ?? 0} XP</span>
                      </div>
                    ))) : (
                      <div className="col-span-full text-center py-20 text-white/20 italic font-black uppercase tracking-widest border-2 border-dashed border-white/5">{t('home.no_activity')}</div>
                    )}
                  </div>
                )}

                {activeTab === 'TIPS' && (
                  <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                    {tips.map((tip, i) => (
                      <div key={i} className="bg-black border-2 border-white/10 p-6 relative group hover:border-main transition-all shadow-[6px_6px_0px_rgba(255,255,255,0.05)] hover:shadow-[6px_6px_0px_var(--main-color)] hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-main/10 rounded-full">
                            <Lightbulb className="w-5 h-5 text-main" />
                          </div>
                          <h4 className="text-[11px] font-black text-white uppercase italic tracking-widest">{tip.title}</h4>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed italic font-medium">{tip.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'FRIENDS' && (
                  <div className="space-y-10">
                    {/* BYSCARR AMIGOS */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic border-l-4 border-white/20 pl-4">{t('home.search_hunter')}</h3>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={t('home.enter_username')}
                            className="w-full bg-zinc-900 border-4 border-white/10 p-4 text-white font-black italic uppercase focus:border-main outline-none transition-all"
                          />
                        </div>
                        <button 
                          onClick={handleSearch}
                          disabled={isSearching}
                          className="bg-main text-black px-8 font-black italic uppercase text-xs hover:bg-white transition-all shadow-[4px_4px_0px_white] disabled:opacity-50"
                        >
                          {isSearching ? '...' : t('home.scan')}
                        </button>
                      </div>

                      {/* SEARCH RESULT */}
                      <AnimatePresence>
                        {searchResult && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-black border-4 border-white p-6 shadow-[8px_8px_0px_var(--main-color)] flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-zinc-900 border-2 border-white/20 flex items-center justify-center text-xl font-black text-white/20 group-hover:text-main group-hover:border-main/50 transition-all overflow-hidden">
                                {searchResult.profilePic ? (
                                  <img src={searchResult.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  searchResult.username.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <h4 className="text-xl font-black italic uppercase text-white group-hover:text-main transition-colors">{searchResult.username}</h4>
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">{t('common.rank')} {searchResult.rank || 'E'}</p>
                              </div>
                            </div>

                            <div>
                              {searchStatus === 'SELF' ? (
                                <span className="text-[10px] font-black italic uppercase text-white/20 bg-white/5 px-4 py-2 border-2 border-white/10">{t('profile.it_is_you') || 'SYSTEM: SELF'}</span>
                              ) : searchStatus === 'ACCEPTED' ? (
                                <span className="text-[10px] font-black italic uppercase text-main bg-main/10 px-4 py-2 border-2 border-main/50">{t('profile.already_friends')}</span>
                              ) : searchStatus === 'PENDING' ? (
                                <span className="text-[10px] font-black italic uppercase text-white/40 bg-white/5 px-4 py-2 border-2 border-white/20">{t('profile.request_sent')}</span>
                              ) : (
                                <button 
                                  onClick={() => handleAddFriend(searchResult.id)}
                                  disabled={isAdding}
                                  className="bg-main text-black px-6 py-3 font-black italic uppercase text-xs hover:bg-white transition-all shadow-[4px_4px_0px_white] active:shadow-none active:translate-x-1 active:translate-y-1"
                                >
                                  {isAdding ? t('profile.processing') : t('profile.add_friend')}
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                        {!searchResult && searchStatus === 'NOT_FOUND' && !isSearching && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-black text-red-500 uppercase italic tracking-[0.3em] bg-red-500/5 p-4 border-l-4 border-red-500"
                          >
                            {t('home.hunter_not_found') || 'SYSTEM ERROR: HUNTER NOT FOUND'}
                          </motion.p>
                        )}
                      </AnimatePresence>

                    </div>

                    {/* PENDING REQUESTS */}
                    {pendingRequests && pendingRequests.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-main italic border-l-4 border-main pl-4">{t('home.incoming_protocols')}</h3>
                        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                          {pendingRequests.map((req: any, i: number) => (
                            <div key={`req-${i}`} className="bg-main/5 border-2 border-main/20 p-5 flex items-center justify-between shadow-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-sm border-2 border-main/30 bg-main/10 flex items-center justify-center text-sm font-black text-main transform -rotate-3">
                                  {(req.sender?.username ?? '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white italic uppercase">{req.sender?.username ?? t('common.hunter')}</p>
                                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">{t('home.requesting_access')}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button onClick={() => handleRejectRequest(req.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/30 transition-all rounded-sm">
                                  <X className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleAcceptRequest(req.id)} className="p-2.5 bg-main/10 hover:bg-main text-main hover:text-black border border-main/30 transition-all rounded-sm">
                                  <Check className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EXISTING FRIENDS */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic border-l-4 border-white/20 pl-4">{t('home.verified_hunters')}</h3>
                      {friends.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {friends.map((friend, i) => (
                            <div key={i} className="bg-black/40 border-2 border-white/5 p-4 flex items-center justify-between hover:bg-white/5 hover:border-main/40 transition-all cursor-pointer group rounded-sm shadow-md">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-sm border border-white/10 bg-zinc-900 flex items-center justify-center text-xs font-black text-white/30 group-hover:text-main group-hover:border-main/40 transition-all">
                                  {(friend.username ?? '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white italic uppercase group-hover:text-main transition-colors">{friend.username ?? t('common.hunter')}</p>
                                  <p className="text-[9px] text-white/20 uppercase tracking-widest font-black">{t('common.rank')} {friend.rank || 'E'}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-main transition-all transform group-hover:translate-x-1" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-6 border-2 border-dashed border-white/5 rounded-sm">
                          <Users className="w-16 h-16 text-white/5" />
                          <div className="text-center">
                            <p className="text-xs font-black text-white/20 uppercase tracking-[0.4em] italic mb-4">{t('home.alone')}</p>
                            <button className="text-[10px] font-black text-main border-b-2 border-main/20 pb-1 hover:text-white hover:border-white transition-all uppercase italic tracking-widest">
                              {t('home.find_hunters')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
