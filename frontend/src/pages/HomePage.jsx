import { Activity, Zap, Shield, Target, Award, Star } from 'lucide-react';

const HomePage = ({ user, profile }) => {
  const stats = profile?.stats || { STR: 10, AGI: 10, VIT: 10, INT: 10, DEX: 10, DISC: 10 };

  return (
    <div className="space-y-12 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="space-y-2">
          <h1 className="text-8xl font-black italic text-white leading-none tracking-tighter uppercase">{user?.username || 'HUNTER'}</h1>
          <div className="flex items-center gap-4">
            <span className="bg-main text-black px-4 py-1 text-sm font-black transform -skew-x-12 italic uppercase">RANK {profile?.rank || 'E'}</span>
            <span className="text-white/40 text-xs font-black uppercase tracking-widest">Level {profile?.level || 1} Awakened</span>
          </div>
        </div>

        <div className="w-full md:w-96 space-y-4">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/60 italic">
            <span>Progress to Next Rank</span>
            <span>{profile?.xp || 0} / 1000 XP</span>
          </div>
          <div className="h-6 bg-white/5 border border-white/10 transform -skew-x-12 overflow-hidden shadow-[inset_0px_0px_20px_rgba(255,255,255,0.05)]">
            <div 
              className="bg-main h-full shadow-[0_0_20px_var(--main-color)] transition-all duration-1000" 
              style={{ width: `${((profile?.xp || 0) % 1000) / 10}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="system-card p-10 space-y-10 bg-gradient-to-br from-black to-neutral-900 border-white/20">
          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
            <Activity className="w-6 h-6 text-main" />
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Attribute Score</h2>
          </div>
          <div className="grid grid-cols-2 gap-y-10 gap-x-12">
            {Object.entries(stats).map(([key, val]) => (
              <div key={key} className="space-y-1 group">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-main transition-colors">{key}</span>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black italic text-white leading-none tracking-tighter">{val}</span>
                  <div className="h-1 w-full bg-white/5 transform -skew-x-12 mb-1 overflow-hidden">
                    <div className="bg-white/20 h-full w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="system-card p-10 space-y-8 bg-black/40 border-main/40">
          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
            <Target className="w-6 h-6 text-main" />
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Daily Conditioning</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-4 bg-white/5 border border-white/5 hover:border-main/50 transition-colors transform -skew-x-6">
              <Zap className="w-8 h-8 text-main" />
              <div>
                <p className="text-xs font-black uppercase text-white/40 tracking-widest">Active Quests</p>
                <p className="text-2xl font-black italic text-white uppercase italic tracking-tighter">3 Protocols</p>
              </div>
            </div>
            <div className="flex items-center gap-6 p-4 bg-white/5 border border-white/5 hover:border-main/50 transition-colors transform -skew-x-6">
              <Shield className="w-8 h-8 text-main" />
              <div>
                <p className="text-xs font-black uppercase text-white/40 tracking-widest">Fatigue Level</p>
                <p className="text-2xl font-black italic text-white uppercase italic tracking-tighter">0% Hazard</p>
              </div>
            </div>
          </div>
        </div>

        <div className="system-card p-10 flex flex-col justify-between items-center text-center border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--main-color),transparent)] opacity-0 group-hover:opacity-5 transition-opacity duration-700" />
          <Award className="w-20 h-20 text-white/10 mb-6 group-hover:text-main transition-colors duration-500" />
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase italic text-white/80 leading-tight">Achievement<br/><span className="text-main">Incipient</span></h3>
            <p className="text-xs text-white/30 uppercase tracking-[0.2em] font-black italic">Next Trophy: First Blood</p>
          </div>
          <div className="mt-10 flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < 1 ? 'text-main fill-main' : 'text-white/10'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
