import { useState, useEffect, type FC, useRef } from 'react';
import type { PageProps } from '../../types';
import { Swords } from 'lucide-react';
import apiClient from '../../services/apiClient';
import PageLayout from '../../components/common/PageLayout';
import { useLanguage } from '../../LanguageContext';
import {
  AdventureStatus,
  AdventureStore,
  AdventureStats,
  AdventureLog,
  AdventureActions
} from '../../components/adventure';

interface AdventureSession {
  id: number;
  hp: number;
  maxHp: number;
  isActive?: boolean;
  active?: boolean;
  contextHistory: string;
  lastOptions: string;
  pendingQuestId: number | null;
  roomCount: number;
  currentRoomType: string;
  recommendedStats: string | null;
  currentLeague: string | null;
}

const PlayPage: FC<PageProps> = ({ user, profile, fetchProfile }) => {
  const { t } = useLanguage();
  const [session, setSession] = useState<AdventureSession | null>(null);
  const [userStats, setUserStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [buying, setBuying] = useState<boolean>(false);
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
    } catch (err: any) {
      if (err.status !== 404) {
        console.error("Error fetching session", err);
      }
      setSession(null);
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

  const handleBuyPotion = async () => {
    if (!user?.id || (profile?.coins || 0) < 200 || !session) return;
    setBuying(true);
    setError(null);
    try {
      const data = await apiClient<AdventureSession>(`/api/adventure/purchase-potion/${user.id}`, { method: 'POST' });
      setSession(data);
      if (fetchProfile) {
        await fetchProfile(user.id);
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo comprar la poción.');
    }
    setBuying(false);
  };

  if (!user || user.isGuest) {
    return (
      <PageLayout title={t('adventure.title')} subtitle={t('adventure.restricted')} icon={Swords}>
        <div className="flex items-center justify-center h-[50vh] text-text-secondary opacity-20 text-xs tracking-[0.4em] font-black uppercase italic">
          {t('adventure.guest_denied')}
        </div>
      </PageLayout>
    );
  }

  const optionsArray = session?.lastOptions ? session.lastOptions.split('|') : [];
  const isActive = !!session && (session.isActive || session.active);

  return (
    <PageLayout
      title={t('adventure.title')}
      subtitle={t('adventure.gm_protocol')}
      icon={Swords}
    >
      <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-4">
          <AdventureStatus
            hp={session?.hp ?? 100}
            maxHp={session?.maxHp ?? 100}
            level={profile?.level ?? 1}
            league={session?.currentLeague}
          />

          <AdventureStore
            coins={profile?.coins ?? 0}
            buying={buying}
            onBuyPotion={handleBuyPotion}
            canBuy={!!isActive && (profile?.coins ?? 0) >= 200}
          />

          <AdventureStats
            stats={userStats}
            recStats={recStats}
          />
        </div>

        <div className="lg:col-span-8 flex flex-col mt-12 lg:mt-0">
          <AdventureLog
            contextHistory={session?.contextHistory ?? ''}
            hp={session?.hp ?? 0}
            roomCount={session?.roomCount ?? 0}
            currentRoomType={session?.currentRoomType ?? ''}
            loading={loading}
            error={error}
            scrollRef={scrollRef}
          />

          <AdventureActions
            options={optionsArray}
            pendingQuestId={session?.pendingQuestId ?? null}
            hp={session?.hp ?? 0}
            isActive={!!isActive}
            loading={loading}
            onStart={handleStart}
            onAction={handleAction}
            onSkip={handleSkip}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default PlayPage;
