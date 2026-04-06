import { useState, type FC, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Scroll, Swords, Trophy, User, ChevronDown, LogOut, Database, Lock } from 'lucide-react';
import type { AppUser, PlayerProfile, PageProps } from '../types';

/* --- PAGES MAP --- */
import HomePage from '../pages/HomePage';
import QuestsPage from '../pages/QuestsPage';
import PlayPage from '../pages/PlayPage';
import RankingsPage from '../pages/RankingsPage';
import ProfilePage from '../pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';

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
};

/* --- RESTRICTED VIEW --- */
interface RestrictedAccessProps {
  onLogout: () => void;
}

const RestrictedAccess: FC<RestrictedAccessProps> = ({ onLogout }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
    <div className="relative">
      <div className="absolute inset-0 bg-main blur-3xl opacity-20 animate-pulse" />
      <div className="border-4 border-white p-8 relative bg-black shadow-[10px_10px_0px_var(--main-color)] transform -skew-x-6">
        <Lock className="w-16 h-16 text-main mb-4 mx-auto" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          ACCESS <span className="text-main">DENIED</span>
        </h2>
      </div>
    </div>
    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40 italic">
      logeate para acceder a este contenido
    </p>
    <button
      onClick={onLogout}
      className="text-[10px] font-black uppercase tracking-widest text-main hover:text-white transition-colors border-b-2 border-main pb-1 italic"
    >
      INICIAR SESION
    </button>
  </div>
);

/* --- MAIN LAYOUT --- */
interface MainLayoutProps {
  user: AppUser | null;
  profile: PlayerProfile | null;
  onLogout: () => void;
}

const MainLayout: FC<MainLayoutProps> = ({ user, profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  const ActivePage = pageMap[activeTab];
  const rank = profile?.rank || 'E';
  const username = user?.username || 'HUNTER';
  const isGuest = user?.isGuest;

  const isRestricted = isGuest && !['home', 'rankings'].includes(activeTab);

  return (
    <div className="hub-root">
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />

      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="hub-navbar">
        <div className="hub-navbar-inner">
          <button
            onClick={() => setActiveTab('home')}
            className="hub-logo"
          >
            LOCK <span style={{ color: 'var(--main-color)' }}>IN</span>
          </button>

          <div className="hub-nav-links">
            {tabs.filter(t => t.id !== 'play').map(tab => {
              const restricted = isGuest && !['home', 'rankings'].includes(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`hub-nav-link ${activeTab === tab.id ? 'hub-nav-link-active' : ''} ${restricted ? 'opacity-40' : ''} flex items-center gap-2`}
                >
                  {tab.label}
                  {restricted && <Lock className="w-3 h-3" />}
                </button>
              );
            })}
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
                  onClick={() => { setActiveTab('profile'); setUserMenuOpen(false); }}
                  className="hub-dropdown-item"
                >
                  <User className="w-4 h-4" /> PROFILE {isGuest && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                </button>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => { setActiveTab('admin'); setUserMenuOpen(false); }}
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
            {isRestricted ? (
              <RestrictedAccess onLogout={onLogout} />
            ) : (
              <ActivePage user={user} profile={profile} onNavigate={setActiveTab} />
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
          const restricted = isGuest && !['home', 'rankings'].includes(tab.id);

          if (isPlay) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
              onClick={() => setActiveTab(tab.id)}
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
    </div>
  );
};

export default MainLayout;
