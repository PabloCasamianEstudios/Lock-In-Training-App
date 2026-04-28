import { useState, type FC, type ComponentType, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Scroll, Swords, Trophy, User, ChevronDown, LogOut, Database, Lock } from 'lucide-react';
import type { AppUser, PlayerProfile, PageProps } from '../../types';
import { userService } from '../../services/userService';
import { questService } from '../../services/questService';

/* --- PAGES MAP --- */
import HomePage from '../../pages/HomePage';
import QuestsPage from '../../pages/QuestsPage';
import PlayPage from '../../pages/PlayPage';
import RankingsPage from '../../pages/RankingsPage';
import ProfilePage from '../../pages/ProfilePage';
import AdminPage from '../../pages/AdminPage';
import WorkoutCameraPage from '../../pages/WorkoutCameraPage';
import PrivacyPolicyPage from '../../pages/PrivacyPolicyPage';
import RestrictedAccess from '../common/RestrictedAccess';
import LevelUpModal from '../modals/LevelUpModal';
import AchievementToast from '../common/AchievementToast';
import { useLanguage } from '../../LanguageContext';

interface Tab {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'quests', label: 'QUESTS', icon: Scroll },
  { id: 'play', label: 'PLAY', icon: Swords },
  { id: 'rankings', label: 'RANKINGS', icon: Trophy },
  { id: 'profile', label: 'PROFILE', icon: User },
];

const pageMap: Record<string, ComponentType<PageProps>> = {
  home: HomePage,
  quests: QuestsPage,
  play: PlayPage,
  rankings: RankingsPage,
  profile: ProfilePage,
  admin: AdminPage,
  workout: WorkoutCameraPage,
  privacy: PrivacyPolicyPage,
};

/* --- MAIN LAYOUT --- */
interface MainLayoutProps {
  user: AppUser | null;
  profile: PlayerProfile | null;
  onLogout: () => void;
  distributeStats?: (userId: number, distribution: Record<string, number>) => Promise<any>;
  fetchProfile?: (userId: number) => Promise<any>;
}

const MainLayout: FC<MainLayoutProps> = ({ user, profile, onLogout, distributeStats, fetchProfile }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [navParams, setNavParams] = useState<any>({});
  const [isDailyDone, setIsDailyDone] = useState<boolean>(true); 

  const refreshDailyStatus = () => {
    if (user?.id && !user.isGuest) {
      questService.getDailyQuests(user.id)
        .then((dailies: any[]) => {
          const completed = dailies.length > 0 && dailies.some(q => q.completed);
          setIsDailyDone(completed);
        })
        .catch((err: Error) => {
          console.error('Error checking daily status:', err);
          userService.checkDailyStatus(user.id!)
            .then((done: boolean) => setIsDailyDone(done));
        });
    }
  };

  useEffect(() => {
    refreshDailyStatus();
  }, [user?.id, activeTab]);

  useEffect(() => {
    const handleQuestCompleted = () => refreshDailyStatus();
    window.addEventListener('quest_completed', handleQuestCompleted);
    return () => window.removeEventListener('quest_completed', handleQuestCompleted);
  }, [user?.id]);

  const handleNavigate = (tab: string, params: any = {}) => {
    setActiveTab(tab);
    setNavParams(params);
  };

  const ActivePage = pageMap[activeTab];
  const rank = profile?.rank || 'E';
  const username = user?.username || 'HUNTER';
  const isGuest = user?.isGuest;

  const isRestrictedByGuest = isGuest && !['home', 'rankings'].includes(activeTab);
  const isRestrictedByDaily = !isGuest && !isDailyDone && activeTab === 'play';
  const isRestricted = isRestrictedByGuest || isRestrictedByDaily;

  return (
    <div className="hub-root">
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />

      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="hub-navbar">
        <div className="hub-navbar-inner">
          <button
            onClick={() => handleNavigate('home')}
            className="hub-logo"
          >
            LOCK <span style={{ color: 'var(--main-color)' }}>IN</span>
          </button>

          <div className="hub-nav-links items-center">
            {tabs.filter(t => t.id !== 'play').map(tab => {
              const restrictedByGuest = isGuest && !['home', 'rankings'].includes(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id)}
                  className={`hub-nav-link ${activeTab === tab.id ? 'hub-nav-link-active' : ''} ${restrictedByGuest ? 'opacity-40' : ''} flex items-center gap-2`}
                >
                  {tab.label}
                  {restrictedByGuest && <Lock className="w-3 h-3" />}
                </button>
              );
            })}

            <button
              onClick={() => handleNavigate('play')}
              disabled={isGuest}
              className={`ml-4 px-4 py-1.5 font-black italic tracking-widest text-sm transform -skew-x-12 border-2 transition-all flex items-center gap-2
                ${activeTab === 'play' 
                  ? 'bg-main text-black border-main shadow-[4px_4px_0_white]' 
                  : 'bg-black text-main border-main hover:bg-main hover:text-black hover:-translate-y-1 shadow-[4px_4px_0_var(--main-color)]'
                }
                ${isGuest || (!isDailyDone && activeTab !== 'play') ? 'grayscale opacity-50' : ''}
                ${!isDailyDone && !isGuest ? 'border-red-500 text-red-500 shadow-[4px_4px_0_rgba(239,68,68,0.5)]' : ''}
              `}
            >
              <Swords className="w-4 h-4" />
              ADVENTURE
              {(isGuest || !isDailyDone) && <Lock className="w-3 h-3" />}
            </button>
          </div>

          <div className="hub-user-menu-wrapper">
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="hub-user-btn"
            >
              <div className="hub-rank-badge">{rank}</div>
              <span className="hub-username">{username} {isGuest && '(GUEST)'}</span>
              <ChevronDown className={`hub-chevron ${userMenuOpen ? 'hub-chevron-open' : ''}`} />
            </button>

            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="hub-dropdown"
              >
                <button
                  onClick={() => { handleNavigate('profile'); setUserMenuOpen(false); }}
                  className="hub-dropdown-item"
                >
                  <User className="w-4 h-4" /> PROFILE {isGuest && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                </button>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => { handleNavigate('admin'); setUserMenuOpen(false); }}
                    className="hub-dropdown-item text-orange-500"
                  >
                    <Database className="w-4 h-4" /> ADMIN PANEL
                  </button>
                )}
                <div className="hub-dropdown-divider" />
                <button onClick={onLogout} className="hub-dropdown-item hub-dropdown-danger">
                  <LogOut className="w-4 h-4" /> {isGuest ? 'EXIT GUEST MODE' : 'LOGOUT'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="hub-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="hub-page"
          >
            {isRestrictedByGuest ? (
              <RestrictedAccess onLogout={onLogout} />
            ) : isRestrictedByDaily ? (
              <RestrictedAccess 
                onLogout={refreshDailyStatus} 
                title={t('adventure.daily_pending')}
                message={t('adventure.daily_lock_msg')}
                buttonText={t('adventure.verify_status')}
              />
            ) : (
              <ActivePage 
                user={user} 
                profile={profile} 
                onNavigate={handleNavigate} 
                fetchProfile={async (uid: number) => {
                  if (fetchProfile) await fetchProfile(uid);
                  window.dispatchEvent(new CustomEvent('quest_completed'));
                }}
                {...navParams}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="hub-bottom-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isPlay = tab.id === 'play';
          const isActive = activeTab === tab.id;
          const restrictedByGuest = isGuest && !['home', 'rankings'].includes(tab.id);
          const restrictedByDaily = !isGuest && !isDailyDone && tab.id === 'play';
          const restricted = restrictedByGuest || restrictedByDaily;

          if (isPlay) {
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigate(tab.id)}
                className={`hub-bottom-play ${isActive ? 'hub-bottom-play-active' : ''} ${restricted ? 'grayscale opacity-50' : ''} relative`}
              >
                <Swords className="w-7 h-7" />
                {restricted && <Lock className="absolute -top-1 -right-1 w-4 h-4 text-white bg-black rounded-full p-0.5 border border-white" />}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              className={`hub-bottom-btn ${isActive ? 'hub-bottom-btn-active' : ''} ${restricted ? 'opacity-30' : ''}`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {restricted && <Lock className="absolute -top-1 -right-1 w-2.5 h-2.5" />}
              </div>
              <span className="hub-bottom-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* --- MODALS --- */}
      {profile && (profile.statPoints ?? 0) > 0 && distributeStats && (
        <LevelUpModal
          key={`levelup-${profile.level}-${profile.statPoints}`}
          profile={profile}
          onDistribute={(dist) => distributeStats(user?.id || 0, dist)}
        />
      )}
      <AchievementToast />
    </div>
  );
};

export default MainLayout;




