import { useState, useEffect, type FC, useRef } from 'react';
import type { PageProps } from '../types';
import { Swords, Heart, Shield, Activity, Skull, BarChart2 } from 'lucide-react';
import apiClient from '../services/apiClient';

interface AdventureSession {
  id: number;
  hp: number;
  maxHp: number;
  isActive: boolean;
  contextHistory: string;
  lastOptions: string;
  pendingQuestId: number | null;
  roomCount: number;
  currentRoomType: string;
  recommendedStats: string | null;
  currentLeague: string | null;
}

const PlayPage: FC<PageProps> = ({ user, profile }) => {
  const [session, setSession] = useState<AdventureSession | null>(null);
  const [userStats, setUserStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recStats = session?.recommendedStats ? JSON.parse(session.recommendedStats) : {};

  useEffect(() => {
    if (user?.id) {
      fetchCurrentSession();
      fetchUserStats();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.contextHistory]);

  const fetchCurrentSession = async () => {
    try {
      const data = await apiClient<AdventureSession>(`/api/adventure/current/${user!.id}`);
      setSession(data);
    } catch (err) {
      // No active session yet, that's fine
    }
  };

  const fetchUserStats = async () => {
    try {
      const data = await apiClient<Record<string, number>>(`/api/adventure/stats/${user!.id}`);
      setUserStats(data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<AdventureSession>(`/api/adventure/start/${user!.id}`, { method: 'POST' });
      setSession(data);
      fetchUserStats();
    } catch (err: any) {
      setError(err.message || 'Falló la conexión con el Game Master.');
    }
    setLoading(false);
  };

  const handleAction = async (choice: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<AdventureSession>(`/api/adventure/action/${user!.id}`, {
        method: 'POST',
        body: { choice }
      });
      setSession(data);
      fetchUserStats();
    } catch (err: any) {
      setError(err.message || 'Deberás completar la Quest Físicamente antes de continuar.');
    }
    setLoading(false);
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const data = await apiClient<AdventureSession>(`/api/adventure/skip/${user!.id}`, { method: 'POST' });
      setSession(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo saltar la prueba.');
    }
    setLoading(false);
  };

  if (!user || user.isGuest) {
    return (
      <div className="flex items-center justify-center h-full text-white/50 text-xs tracking-widest font-mono">
        RÉGIMEN DE INVITADOS NO AUTORIZADO
      </div>
    );
  }

  const optionsArray = session?.lastOptions ? session.lastOptions.split('|') : [];

  return (
    <div className="h-full w-full flex flex-col md:flex-row gap-4 p-4 lg:p-8 bg-black font-mono overflow-y-auto pb-24">
      {/* LEFT COLUMN: HERO STATS */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="text-white font-black text-xl italic uppercase">STATUS</h2>
            <div className="flex flex-col items-end">
              <div className="text-orange-500 font-black text-sm">LVL {profile?.level || 1}</div>
              {session?.currentLeague && (
                <div className="text-[10px] text-white/40 uppercase tracking-tighter">LIGA {session.currentLeague}</div>
              )}
            </div>
          </div>
          
          {/* Health Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-white/70">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500"/> HP</span>
              <span>{session ? session.hp : (profile?.stats?.VIT ? 50 + (Number(profile.stats.VIT) * 10) : 100)} / {session ? session.maxHp : (profile?.stats?.VIT ? 50 + (Number(profile.stats.VIT) * 10) : 100)}</span>
            </div>
            <div className="h-2 w-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${session && session.hp <= 0 ? 'bg-red-600' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}
                style={{ width: `${session ? Math.max(0, (session.hp / session.maxHp) * 100) : 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* EQUIPMENT */}
        <div className="border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
          <h2 className="text-white font-black text-sm italic uppercase border-b border-white/10 pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4"/> EQUIPAMIENTO
          </h2>
          <div className="text-[10px] text-white/40 leading-relaxed italic">
            (Tus objetos de la tienda aparecerán aquí)
          </div>
        </div>

        {/* STATS */}
        <div className="border border-white/10 bg-white/5 p-4 flex flex-col gap-3 flex-grow">
          <h2 className="text-white font-black text-sm italic uppercase border-b border-white/10 pb-2 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-orange-500"/> ESTADÍSTICAS
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(userStats).length > 0 ? Object.entries(userStats).map(([k, v]) => {
              const recommended = recStats[k] || recStats[k.toLowerCase()] || 0;
              const isAdequate = v >= recommended;
              
              return (
                <div key={k} className={`flex justify-between items-center text-xs p-2 bg-black/50 border transition-colors ${
                  recommended > 0 ? (isAdequate ? 'border-green-500/30' : 'border-red-500/50 animate-pulse') : 'border-white/5'
                }`}>
                  <div className="flex flex-col">
                    <span className="text-white/50 uppercase font-mono text-[10px]">{k}</span>
                    <span className="text-white font-black">{v}</span>
                  </div>
                  {recommended > 0 && (
                    <div className="text-right">
                      <div className="text-[9px] text-white/30 uppercase">REQ</div>
                      <div className={`font-black ${isAdequate ? 'text-green-500' : 'text-red-500'}`}>{recommended}</div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="col-span-2 text-[10px] text-white/30 italic">Cargando estadísticas...</div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN ADVENTURE TEXT */}
      <div className="w-full md:w-2/3 flex flex-col border border-white/20 bg-black shadow-[0_0_30px_rgba(249,115,22,0.1)] relative">
        <div className="p-3 border-b border-white/20 flex justify-between items-center bg-white/5">
          <h1 className="text-orange-500 font-black italic tracking-widest text-lg flex items-center gap-2">
            <Swords className="w-5 h-5"/> GAME MASTER
          </h1>
          {session && (
            <div className="flex gap-4 items-center">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/40 uppercase">SALA</span>
                <span className="text-white font-black text-sm tracking-widest">{session.roomCount}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/40 uppercase">TIPO</span>
                <span className={`font-black text-sm tracking-widest ${
                  session.currentRoomType === 'BOSS' ? 'text-red-500 animate-pulse' : 
                  session.currentRoomType === 'COMBATE' ? 'text-orange-500' : 
                  'text-blue-400'
                }`}>
                  {session.currentRoomType || 'UNKNOWN'}
                </span>
              </div>
            </div>
          )}
          {loading && <Activity className="w-4 h-4 text-orange-500 animate-spin"/>}
        </div>

        {/* TEXT LOG */}
        <div 
          ref={scrollRef}
          className="flex-grow p-4 md:p-6 overflow-y-auto text-sm md:text-base text-white/90 leading-relaxed font-serif whitespace-pre-wrap"
          style={{ maxHeight: '50vh' }}
        >
          {error && <div className="text-red-500 mb-4 font-mono text-xs">{error}</div>}
          
          {!session ? (
            <div className="text-white/50 italic text-center mt-10 font-mono">
              The darkness awaits. Are you prepared to step into the dungeon?
            </div>
          ) : (
            <>
              {session.contextHistory.split('\n').map((line, idx) => (
                <p key={idx} className={`mb-3 ${line.startsWith('User chose:') ? 'text-orange-400 font-bold ml-4 border-l-2 border-orange-500 pl-2 font-mono text-xs uppercase my-4' : 'text-gray-300'}`}>
                  {line}
                </p>
              ))}
              {session.hp <= 0 && (
                <div className="text-red-600 font-black text-3xl text-center mt-10 animate-pulse flex flex-col items-center gap-2">
                  <Skull className="w-12 h-12"/>
                  YOU DIED
                </div>
              )}
            </>
          )}
        </div>

        {/* CHOICES / CONTROLS */}
        <div className="p-4 bg-white/5 border-t border-white/20 mt-auto min-h-[100px]">
          {!session || (!session.isActive && session.hp <= 0) ? (
             <button 
                onClick={handleStart}
                disabled={loading}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase tracking-widest transition-all skew-x-[-10deg] shadow-[5px_5px_0_white]"
              >
               <span className="skew-x-[10deg] inline-block">{session && session.hp <= 0 ? 'START NEW CAMPAIGN' : 'ENTER DUNGEON'}</span>
             </button>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {session.pendingQuestId ? (
                <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                  <div className="text-center border border-red-500/50 bg-red-500/10 p-4 text-red-500 text-xs font-black uppercase tracking-widest animate-pulse">
                    PATH BLOCKED! A physical trial awaits in your Quests Tab.
                  </div>
                  <button 
                    onClick={handleSkip}
                    disabled={loading}
                    className="py-2 bg-white/10 hover:bg-white/20 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-tighter transition-all border border-white/5"
                  >
                    DEBUG: SKIP TRIAL (ADVANCE STORY)
                  </button>
                </div>
              ) : optionsArray.length > 0 ? (
                optionsArray.map((opt, i) => (
                  <button 
                    key={i}
                    disabled={loading}
                    onClick={() => handleAction(opt)}
                    className="p-3 border border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white transition-all text-xs font-bold uppercase tracking-wider text-left disabled:opacity-50"
                  >
                    {opt.replace(/"/g, '')}
                  </button>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 text-white/50 text-xs text-center italic">
                  No options available...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayPage;
