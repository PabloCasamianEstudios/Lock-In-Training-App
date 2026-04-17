import { useState, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Trophy, 
  Flame, 
  ChevronRight, 
  Bell, 
  Users, 
  Lightbulb, 
  Activity as ActivityIcon 
} from 'lucide-react';
import type { PageProps } from '../types';
import { useHomeData } from '../hooks/useHomeData';
import AppHeader from '../components/common/AppHeader';
import BrutalistCard from '../components/common/BrutalistCard';
import ProgressBar from '../components/common/ProgressBar';

const HomePage: FC<PageProps> = ({ user }) => {
  const { 
    username,
    profilePic,
    activeQuestsCount, 
    friends, 
    activity, 
    tips,
    streak, 
    level, 
    xp, 
    seasonRank, 
    loading 
  } = useHomeData(user?.id);

  const [activeTab, setActiveTab] = useState<'FEED' | 'ACTIVITY' | 'TIPS' | 'FRIENDS'>('FEED');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-main animate-pulse font-black italic uppercase tracking-widest">
          Loading System Data...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <AppHeader title="HOME" />

      <BrutalistCard>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-zinc-800 overflow-hidden">
            {profilePic ? (
              <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-8 h-8 text-white/50" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white leading-tight">{username}</h2>
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-white/60">lv.{level}</span>
              <span className="text-sm font-black text-white/40 uppercase tracking-widest">RANK {seasonRank}</span>
            </div>
            <ProgressBar progress={xp % 1000} max={1000} className="mt-1" />
          </div>
        </div>
      </BrutalistCard>

      <BrutalistCard variant="accent" padding="p-0" className="grid grid-cols-3 overflow-hidden">
        <div className="flex flex-col items-center justify-center p-4 border-r-2 border-white group hover:bg-main/5 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-black italic text-white leading-none tracking-tighter">
              {activeQuestsCount}/3
            </span>
            <Shield className="w-4 h-4 text-main fill-main" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">QUESTS</span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 border-r-2 border-white group hover:bg-main/5 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-main" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap">RANK {seasonRank}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 group hover:bg-main/5 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-black italic text-white leading-none tracking-tighter">
              {streak}
            </span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">STREAK</span>
        </div>
      </BrutalistCard>

      {/* --- TABS --- */}
      <nav className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-2">
        {(['FEED', 'ACTIVITY', 'TIPS', 'FRIENDS'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-[10px] font-black border-2 transition-all uppercase tracking-widest whitespace-nowrap
              ${activeTab === tab 
                ? 'bg-main text-black border-main' 
                : 'bg-black text-white/40 border-white/20 hover:border-white/40'}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* --- TAB CONTENT --- */}
      <main className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'FEED' && (
              <div className="space-y-4">
                {/* Featured Card */}
                <div className="bg-black border-4 border-white p-6 relative overflow-hidden shadow-[10px_10px_0px_white]">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-main/10 rounded-full blur-3xl" />
                  <h3 className="text-5xl font-black italic tracking-tighter text-white leading-none mb-4">LAUNCH!</h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-white/60 leading-relaxed italic">
                      texto de launch launch launch
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <button className="button-neon !px-4 !py-2 !text-[10px] !shadow-[4px_4px_0px_white]">
                      READ MORE
                    </button>
                    <span className="text-[10px] font-black text-white/30 tracking-widest italic">156/03</span>
                  </div>
                </div>

                {/* Additional feed items could go here */}
              </div>
            )}

            {activeTab === 'ACTIVITY' && (
              <div className="space-y-3">
                {activity.length > 0 ? (activity.slice(0, 5).map((act, i) => (
                  <div key={i} className="bg-black/40 border border-white/10 p-4 flex items-center justify-between group hover:border-main transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-main/10 rounded-sm">
                        <ActivityIcon className="w-4 h-4 text-main" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase italic">{act.title ?? 'Quest'}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">
                          {act.completionTime ? new Date(act.completionTime).toLocaleDateString() : 'In progress'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-main italic">+{act.xpReward ?? 0} XP</span>
                  </div>
                ))) : (
                  <div className="text-center py-10 text-white/20 italic font-black uppercase tracking-widest">No activity recorded</div>
                )}
              </div>
            )}

            {activeTab === 'TIPS' && (
              <div className="space-y-4">
                {tips.map((tip, i) => (
                  <div key={i} className="bg-black border-2 border-white/20 p-4 relative group hover:border-main transition-colors shadow-[4px_4px_0px_rgba(255,255,255,0.1)] hover:shadow-[4px_4px_0px_var(--main-color)]">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-main" />
                      <h4 className="text-xs font-black text-white uppercase italic">{tip.title}</h4>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{tip.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'FRIENDS' && (
              <div className="space-y-3">
                {friends.length > 0 ? (friends.map((friend, i) => (
                  <div key={i} className="bg-black border border-white/10 p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-white/20 bg-zinc-800 flex items-center justify-center text-xs font-black text-white/40">
                        {(friend.username ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white italic">{friend.username ?? 'Hunter'}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">RANK {friend.seasonRank || 'E'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </div>
                ))) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Users className="w-12 h-12 text-white/10" />
                    <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Alone in the shadows...</p>
                    <button className="text-[10px] font-black text-main border-b border-main pb-1 hover:text-white hover:border-white transition-all uppercase italic">
                      FIND HUNTERS
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default HomePage;
