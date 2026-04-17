import { useState, useEffect, type FC, useRef } from 'react';
import type { PageProps } from '../types';
import { Swords, Heart, Shield, Activity, Skull, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../services/apiClient';
import AppHeader from '../components/common/AppHeader';
import BrutalistCard from '../components/common/BrutalistCard';
import ProgressBar from '../components/common/ProgressBar';

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
        INVITADOS NO
      </div>
    );
  }

  const optionsArray = session?.lastOptions ? session.lastOptions.split('|') : [];

  return (
    <div className="max-w-md mx-auto space-y-8 pb-20 p-4">
      <AppHeader title="ADVENTURE" />

      <div className="flex flex-col gap-6">
        <BrutalistCard padding="p-4" className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b-2 border-white/10 pb-2">
            <h2 className="text-white font-black text-2xl italic uppercase tracking-widest">STATUS</h2>
            <div className="flex flex-col items-end">
              <div className="text-main font-black text-lg italic">LVL {profile?.level || 1}</div>
              {session?.currentLeague && (
                <div className="text-xs text-white/40 uppercase tracking-widest font-bold">LIGA {session.currentLeague}</div>
              )}
            </div>
          </div>
          
          <ProgressBar 
            progress={session ? session.hp : 100} 
            max={session ? session.maxHp : 100}
            color={session && session.hp <= 25 ? 'bg-red-600' : 'bg-green-500'}
            height="h-4"
            label={<><Heart className="w-4 h-4 text-red-500 fill-red-500"/> HP</>}
            valueLabel={`${session ? session.hp : 100} / ${session ? session.maxHp : 100}`}
          />
        </BrutalistCard>

        <BrutalistCard padding="p-4" className="flex flex-col gap-3" variant="accent">
          <h2 className="text-white font-black text-xl italic uppercase border-b-2 border-white/10 pb-2 flex items-center gap-2 tracking-widest">
            <Shield className="w-4 h-4"/> EQUIPAMIENTO
          </h2>
          <div className="text-xs text-white/40 leading-relaxed italic font-bold uppercase tracking-wider">
            (Tus objetos de la tienda aparecerán aquí)
          </div>
        </BrutalistCard>

        <BrutalistCard padding="p-4" className="flex flex-col gap-3 flex-grow" variant="white">
          <h2 className="text-white font-black text-xl italic uppercase border-b-2 border-white/10 pb-2 flex items-center gap-2 tracking-widest">
            <BarChart2 className="w-4 h-4 text-orange-500"/> ESTADÍSTICAS
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(userStats).length > 0 ? Object.entries(userStats).map(([k, v]) => {
              const recommended = recStats[k] || recStats[k.toLowerCase()] || 0;
              const isAdequate = v >= recommended;
              
              return (
                <div key={k} className={`flex justify-between items-center text-sm p-3 bg-black border-2 transition-colors ${
                  recommended > 0 ? (isAdequate ? 'border-green-500/50 hover:border-green-500' : 'border-red-500 animate-pulse') : 'border-white/20 hover:border-main'
                } shadow-[4px_4px_0_rgba(255,255,255,0.1)]`}>
                  <div className="flex flex-col">
                    <span className="text-white/50 uppercase font-black italic text-xs tracking-widest">{k}</span>
                    <span className="text-white font-black">{v}</span>
                  </div>
                  {recommended > 0 && (
                    <div className="text-right">
                      <div className="text-[10px] text-white/30 uppercase">REQ</div>
                      <div className={`font-black ${isAdequate ? 'text-green-500' : 'text-red-500'}`}>{recommended}</div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="col-span-2 text-[10px] text-main/50 italic uppercase font-black tracking-widest animate-pulse">CARGANDO ESTADÍSTICAS...</div>
            )}
          </div>
        </BrutalistCard>
      </div>

      {/* MAIN ADVENTURE TEXT */}
      <BrutalistCard padding="p-0" variant="heavy" className="w-full flex flex-col relative mt-4">
        <div className="p-4 border-b-4 border-white flex justify-between items-center bg-black">
          <h2 className="text-main font-black italic tracking-widest text-2xl flex items-center gap-2 uppercase">
            <Swords className="w-6 h-6"/> GAME MASTER
          </h2>
          {session && (
            <div className="flex gap-4 items-center">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/40 uppercase font-black">SALA</span>
                <span className="text-white font-black text-lg tracking-widest">{session.roomCount}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/40 uppercase font-black">TIPO</span>
                <span className={`font-black text-lg tracking-widest ${
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
          className="flex-grow p-4 md:p-6 overflow-y-auto text-sm md:text-base text-white/90 leading-relaxed uppercase whitespace-pre-wrap bg-black/80 font-bold tracking-wider"
          style={{ maxHeight: '50vh' }}
        >
          {error && <div className="text-red-500 mb-4 font-black italic text-sm uppercase tracking-widest border-2 border-red-500 p-2 bg-red-500/10">{error}</div>}
          
          {!session ? (
            <div className="text-white/50 italic text-center mt-10 font-black uppercase tracking-widest text-sm">
              THE DARKNESS AWAITS. ARE YOU PREPARED TO STEP INTO THE DUNGEON?
            </div>
          ) : (
            <>
              {session.contextHistory.split('\n').map((line, idx) => (
                <p key={idx} className={`mb-4 ${line.startsWith('User chose:') ? 'text-main font-black ml-4 border-l-4 border-main pl-3 text-sm uppercase my-6 tracking-widest italic' : 'text-gray-300'}`}>
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
        <div className="p-4 bg-black border-t-4 border-white mt-auto min-h-[100px]">
          {!session || (!session.isActive && session.hp <= 0) ? (
             <button 
                onClick={handleStart}
                disabled={loading}
                className="w-full py-4 bg-main hover:bg-white text-black font-black uppercase tracking-widest transition-all transform -skew-x-12 border-4 border-transparent hover:border-black shadow-[6px_6px_0px_white] hover:shadow-[8px_8px_0px_var(--main-color)] hover:-translate-y-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed group text-lg"
              >
               <span className="skew-x-12 inline-block group-hover:scale-110 transition-transform">{session && session.hp <= 0 ? 'START NEW CAMPAIGN' : 'ENTER DUNGEON'}</span>
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
                    className="py-3 bg-black hover:bg-main text-white/50 hover:text-black font-black uppercase tracking-widest transition-all border-2 border-white/20 hover:border-main transform -skew-x-6 text-[10px]"
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
                    className="p-4 bg-black border-2 border-white text-white hover:bg-main hover:text-black hover:border-main shadow-[4px_4px_0_white] hover:shadow-[4px_4px_0_var(--main-color)] transition-all font-black uppercase italic tracking-wider text-left disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 active:translate-y-1 active:shadow-none text-xs md:text-sm"
                  >
                    {opt.replace(/"/g, '')}
                  </button>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 text-main/50 text-xs text-center italic font-black uppercase tracking-widest animate-pulse mt-4">
                  NO OPTIONS AVAILABLE...
                </div>
              )}
            </div>
          )}
        </div>
      </BrutalistCard>
    </div>
  );
};

export default PlayPage;
