import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Scroll, Swords, Trophy, User, ChevronDown, LogOut, Database } from 'lucide-react';

import HomePage from '../pages/HomePage';
import QuestsPage from '../pages/QuestsPage';
import PlayPage from '../pages/PlayPage';
import RankingsPage from '../pages/RankingsPage';
import ProfilePage from '../pages/ProfilePage';
import AdminPage from '../pages/AdminPage';

const tabs = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'quests', label: 'QUESTS', icon: Scroll },
  { id: 'play', label: 'PLAY', icon: Swords },
  { id: 'rankings', label: 'RANKINGS', icon: Trophy },
  { id: 'profile', label: 'PROFILE', icon: User },
];

const pageMap = {
  home: HomePage,
  quests: QuestsPage,
  play: PlayPage,
  rankings: RankingsPage,
  profile: ProfilePage,
  admin: AdminPage,
};

const MainLayout = ({ user, profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const ActivePage = pageMap[activeTab];
  const rank = profile?.rank || 'E';
  const username = user?.username || 'HUNTER';

  return (
    <div className="hub-root">
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />

      {/* ─── DESKTOP TOP NAVBAR ─── */}
      <nav className="hub-navbar">
        <div className="hub-navbar-inner">
          <button
            onClick={() => setActiveTab('home')}
            className="hub-logo"
          >
            LOCK <span style={{ color: 'var(--main-color)' }}>IN</span>
          </button>

          <div className="hub-nav-links">
            {tabs.filter(t => t.id !== 'play').map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`hub-nav-link ${activeTab === tab.id ? 'hub-nav-link-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hub-user-menu-wrapper">
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="hub-user-btn"
            >
              <div className="hub-rank-badge">{rank}</div>
              <span className="hub-username">{username}</span>
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
                  <User className="w-4 h-4" /> PROFILE
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
                  <LogOut className="w-4 h-4" /> LOGOUT
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── MAIN CONTENT ─── */}
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
            <ActivePage user={user} profile={profile} onNavigate={setActiveTab} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── MOBILE BOTTOM NAVIGATION ─── */}
      <nav className="hub-bottom-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isPlay = tab.id === 'play';
          const isActive = activeTab === tab.id;

          if (isPlay) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`hub-bottom-play ${isActive ? 'hub-bottom-play-active' : ''}`}
              >
                <Swords className="w-7 h-7" />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`hub-bottom-btn ${isActive ? 'hub-bottom-btn-active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="hub-bottom-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MainLayout;
