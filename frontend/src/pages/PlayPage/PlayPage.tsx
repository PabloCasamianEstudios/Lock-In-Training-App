import { useState, useEffect, type FC, useRef } from 'react';
import type { PageProps } from '../../types';
import { Swords, Heart, Shield, Activity, Skull, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import PageLayout from '../../components/common/PageLayout';
import BrutalistCard from '../../components/common/BrutalistCard';
import ProgressBar from '../../components/common/ProgressBar';
import { useLanguage } from '../../LanguageContext';

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
  const { t } = useLanguage();
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
      <PageLayout title={t('adventure.title')} subtitle={t('adventure.restricted')} icon={Swords}>
        <div className="flex items-center justify-center h-[50vh] text-white/20 text-xs tracking-[0.4em] font-black uppercase italic">
          {t('adventure.guest_denied')}
        </div>
      </PageLayout>
    );
  }

  const optionsArray = session?.lastOptions ? session.lastOptions.split('|') : [];

  return (
    <PageLayout 
      title={t('adventure.title')} 
      subtitle={t('adventure.gm_protocol')} 
      icon={Swords}
    >
      <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-4">
          <BrutalistCard padding="p-6" className="flex flex-col gap-4 shadow-[8px_8px_0px_white] border-4 border-white">
            <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
              <h2 className="text-white font-black text-2xl italic uppercase tracking-tighter">{t('adventure.status')}</h2>
              <div className="flex flex-col items-end">
                <div className="text-main font-black text-xl italic leading-none">LVL {profile?.level || 1}</div>
                {session?.currentLeague && (
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black mt-1 italic">{session.currentLeague} LEAGUE</div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <ProgressBar 
                progress={session ? session.hp : 100} 
                max={session ? session.maxHp : 100}
                color={session && session.hp <= 25 ? 'bg-red-600' : 'bg-green-500'}
                height="h-5"
                label={<div className="flex items-center gap-2"><Heart className="w-4 h-4 text-red-500 fill-red-500"/> <span className="text-[10px] font-black uppercase italic tracking-widest text-white/50">{t('adventure.vitality')}</span></div>}
                valueLabel={`${session ? session.hp : 100} / ${session ? session.maxHp : 100}`}
              />
            </div>
          </BrutalistCard>

          <BrutalistCard padding="p-6" className="flex flex-col gap-4 shadow-[8px_8px_0px_rgba(255,255,255,0.05)] border-2 border-white/10" variant="accent">
            <h2 className="text-white font-black text-lg italic uppercase border-b border-white/10 pb-3 flex items-center gap-3 tracking-widest">
              <Shield className="w-5 h-5 text-main"/> {t('adventure.arsenal')}
            </h2>
            <div className="text-[10px] text-white/20 leading-relaxed italic font-black uppercase tracking-[0.2em]">
              {t('adventure.arsenal_empty')}
            </div>
          </BrutalistCard>

          <BrutalistCard padding="p-6" className="flex flex-col gap-4 shadow-[8px_8px_0px_white] border-4 border-white" variant="white">
            <h2 className="text-white font-black text-lg italic uppercase border-b border-white/10 pb-3 flex items-center gap-3 tracking-widest">
              <BarChart2 className="w-5 h-5 text-orange-500"/> {t('adventure.attributes')}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {Object.keys(userStats).length > 0 ? Object.entries(userStats).map(([k, v]) => {
                const recommended = recStats[k] || recStats[k.toLowerCase()] || 0;
                const isAdequate = v >= recommended;
                
                return (
                  <div key={k} className={`flex justify-between items-center p-4 bg-black border-2 transition-all group ${
                    recommended > 0 ? (isAdequate ? 'border-green-500/30 hover:border-green-500' : 'border-red-600 animate-pulse') : 'border-white/5 hover:border-main/50'
                  } shadow-md`}>
                    <div className="flex flex-col">
                      <span className="text-white/30 uppercase font-black italic text-[9px] tracking-[0.2em]">{k}</span>
                      <span className="text-white font-black text-lg italic leading-none mt-1 group-hover:text-main transition-colors">{v}</span>
                    </div>
                    {recommended > 0 && (
                      <div className="text-right">
                        <div className="text-[8px] text-white/20 uppercase font-black tracking-widest">REQ</div>
                        <div className={`font-black text-lg italic ${isAdequate ? 'text-green-500' : 'text-red-600'}`}>{recommended}</div>
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="col-span-2 py-8 text-center text-[10px] text-main/30 italic uppercase font-black tracking-[0.3em] animate-pulse">{t('adventure.streaming')}</div>
              )}
            </div>
          </BrutalistCard>
        </div>

        <div className="lg:col-span-8 flex flex-col mt-12 lg:mt-0">
          <BrutalistCard padding="p-0" variant="heavy" className="w-full flex flex-col relative shadow-[16px_16px_0px_white] border-4 border-white overflow-hidden">
            <div className="p-6 border-b-4 border-white flex justify-between items-center bg-black/40 backdrop-blur-md">
              <h2 className="text-main font-black italic tracking-tighter text-3xl flex items-center gap-3 uppercase">
                <Swords className="w-8 h-8"/> {t('adventure.game_master')}
              </h2>
              {session && (
                <div className="flex gap-6 items-center">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">{t('adventure.room')}</span>
                    <span className="text-white font-black text-2xl tracking-tighter italic leading-none">{session.roomCount}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">{t('adventure.type')}</span>
                    <span className={`font-black text-2xl tracking-tighter italic leading-none ${
                      session.currentRoomType === 'BOSS' ? 'text-red-600 animate-pulse' : 
                      session.currentRoomType === 'COMBATE' ? 'text-orange-500' : 
                      'text-main'
                    }`}>
                      {session.currentRoomType || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              )}
              {loading && <Activity className="w-5 h-5 text-main animate-spin"/>}
            </div>

            {/* TEXT LOG */}
            <div 
              ref={scrollRef}
              className="flex-grow p-8 md:p-12 overflow-y-auto text-sm md:text-xl text-white/80 leading-relaxed uppercase whitespace-pre-wrap bg-black/60 font-black tracking-wider no-scrollbar custom-scrollbar"
              style={{ minHeight: '500px', maxHeight: '75vh' }}
            >
              {error && <div className="text-red-600 mb-6 font-black italic text-xs uppercase tracking-[0.2em] border-4 border-red-600 p-4 bg-red-600/10 shadow-lg">{error}</div>}
              
              {!session ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-20">
                   <Skull className="w-20 h-20"/>
                  <div className="text-white italic text-center font-black uppercase tracking-[0.4em] text-xs">
                    {t('adventure.darkness_awaits')}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {session.contextHistory.split('\n').map((line, idx) => (
                    <p key={idx} className={`${line.startsWith('User chose:') ? 'text-main font-black border-l-4 border-main pl-6 py-2 bg-main/5 text-sm uppercase my-10 tracking-[0.2em] italic' : 'text-gray-300 drop-shadow-sm'}`}>
                      {line}
                    </p>
                  ))}
                  {session.hp <= 0 && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-red-600 font-black text-6xl text-center py-20 animate-pulse flex flex-col items-center gap-4 tracking-tighter italic"
                    >
                      <Skull className="w-24 h-24"/>
                      {t('adventure.you_died')}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* CHOICES / CONTROLS */}
            <div className="p-8 bg-black/90 border-t-4 border-white mt-auto min-h-[140px]">
              {!session || (!session.isActive && session.hp <= 0) ? (
                <button 
                    onClick={handleStart}
                    disabled={loading}
                    className="w-full py-6 bg-main hover:bg-white text-black font-black uppercase tracking-[0.3em] transition-all border-4 border-transparent hover:border-black shadow-[10px_10px_0px_white] hover:shadow-[12px_12px_0px_var(--main-color)] hover:-translate-y-2 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed group text-xl italic"
                  >
                  <span className="inline-block group-hover:scale-110 transition-transform">{session && session.hp <= 0 ? t('adventure.start_new') : t('adventure.enter_dungeon')}</span>
                </button>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.pendingQuestId ? (
                    <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                      <div className="text-center border-4 border-red-600 bg-red-600/10 p-6 text-red-600 text-xs font-black uppercase tracking-[0.3em] animate-pulse italic shadow-lg">
                        {t('adventure.path_blocked')}
                      </div>
                      <button 
                        onClick={handleSkip}
                        disabled={loading}
                        className="py-4 bg-black hover:bg-main text-white/30 hover:text-black font-black uppercase tracking-[0.2em] transition-all border-2 border-white/10 hover:border-main text-[10px] italic"
                      >
                        {t('adventure.override_trial')}
                      </button>
                    </div>
                  ) : optionsArray.length > 0 ? (
                    optionsArray.map((opt, i) => (
                      <button 
                        key={i}
                        disabled={loading}
                        onClick={() => handleAction(opt)}
                        className="p-6 bg-black border-2 border-white/20 text-white hover:bg-main hover:text-black hover:border-main shadow-[6px_6px_0px_rgba(255,255,255,0.05)] hover:shadow-[6px_6px_0px_var(--main-color)] transition-all font-black uppercase italic tracking-widest text-left disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 active:translate-y-1 active:shadow-none text-xs md:text-sm"
                      >
                        {opt.replace(/"/g, '')}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-1 md:col-span-2 text-main/30 text-xs text-center italic font-black uppercase tracking-[0.4em] animate-pulse py-6">
                      {t('adventure.waiting_gm')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </BrutalistCard>
        </div>
      </div>
    </PageLayout>
  );
};

export default PlayPage;
