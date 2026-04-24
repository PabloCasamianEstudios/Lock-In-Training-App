import { useState, type FC, useMemo } from 'react';
import { useQuests } from '../../hooks/useQuests';
import { Plus, Zap, Coins, Info, AlertTriangle, Trophy, ScrollText } from 'lucide-react';
import type { PageProps } from '../../types';
import CreateQuestModal from '../../components/quests/CreateQuestModal';
import ActiveQuestView from '../../components/quests/ActiveQuestView';
import PageLayout from '../../components/common/PageLayout';
import PopupWindow from '../../components/common/PopupWindow';
import { useLanguage } from '../../LanguageContext';

interface QuestsPageProps extends PageProps {
  onNavigate?: (tab: string, params?: any) => void;
  fetchProfile?: (userId: number) => Promise<any>;
}

const QuestsPage: FC<QuestsPageProps> = ({ user, profile, onNavigate, fetchProfile }) => {
  const { t } = useLanguage();
  const { quests, activeQuest, systemQuests, loading, error, startQuest, startSystemQuest, cancelQuest, completeQuest, createCustomQuest, updateCustomQuest, deleteCustomQuest, getCustomQuests } = useQuests(user?.id ?? null);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'DAILY' | 'ACTIVE' | 'YOURS' | 'SYSTEM'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<any | null>(null);
  const [systemPopup, setSystemPopup] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    type: 'INFO' | 'WARNING' | 'DANGER' | 'REWARDS';
    onConfirm?: () => void;
    rewards?: { gold: number; xp: number }
  } | null>(null);

  const closePopup = () => setSystemPopup(null);

  const customQuests = useMemo(() => getCustomQuests(), [getCustomQuests]);

  const dailyQuests = useMemo(() => quests.filter(q => !q.completed), [quests]);
  const dailyQuestsCount = dailyQuests.length;
  const yoursQuestsCount = customQuests.length;
  const systemQuestsCount = systemQuests.length;
  const activeQuestsCount = activeQuest ? 1 : 0;

  const handleCompleteQuest = async (id: number) => {
    try {
      const response: any = await completeQuest(id);
      setSystemPopup({
        isOpen: true,
        title: t('quests.protocol_success'),
        type: 'REWARDS',
        rewards: {
          gold: response?.goldReward || 0,
          xp: response?.xpReward || 0
        }
      });

      if (response?.unlockedAchievements && response.unlockedAchievements.length > 0) {
        window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: response.unlockedAchievements }));
      }

      if (fetchProfile && user?.id) {
        await fetchProfile(user.id);
      }
    } catch (err: any) {
      setSystemPopup({
        isOpen: true,
        title: 'SYNC ERROR',
        message: err.message || 'FAILED TO UPLOAD DATA TO COLISEUM.',
        type: 'DANGER'
      });
    }
  };

  const filteredQuests = useMemo(() => {
    switch (activeSubTab) {
      case 'DAILY': return dailyQuests;
      case 'SYSTEM': return systemQuests;
      case 'YOURS': return customQuests;
      case 'ALL': return [...dailyQuests, ...systemQuests, ...customQuests];
      default: return [];
    }
  }, [activeSubTab, dailyQuests, customQuests, systemQuests]);

  if (loading) {
    return (
      <PageLayout title={t('quests.title')} subtitle={t('quests.subtitle_decrypting')} icon={ScrollText}>
        <div className="p-10 text-main animate-pulse font-black uppercase text-xs italic tracking-widest text-center mt-20">{t('quests.initializing')}</div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={t('quests.title')} subtitle={t('quests.error')} icon={ScrollText}>
        <div className="p-10 text-red-500 uppercase font-black text-center mt-20 border-4 border-red-500 bg-red-500/10">Error: {error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('quests.title')}
      subtitle={t('quests.subtitle_assignments')}
      icon={ScrollText}
    >
      <div className="md:grid md:grid-cols-12 md:gap-12 items-start">
        {/* --- LEFT SIDE: FILTERS --- */}
        <aside className="md:col-span-3 lg:col-span-2 space-y-4 md:sticky md:top-4">
          <h3 className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic mb-6 border-l-4 border-main pl-3">{t('quests.protocols')}</h3>
          <nav className="flex md:flex-col items-center gap-2 overflow-x-auto no-scrollbar py-2 md:py-0 mb-4 md:mb-0">
            {[
              { id: 'ALL', label: t('quests.tabs.all') },
              { id: 'SYSTEM', label: `${t('quests.tabs.system')} (${systemQuestsCount})` },
              { id: 'DAILY', label: `${t('quests.tabs.daily')} (${dailyQuestsCount})` },
              { id: 'ACTIVE', label: `${t('quests.tabs.active')} (${activeQuestsCount})` },
              { id: 'YOURS', label: `${t('quests.tabs.yours')} (${yoursQuestsCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full text-left px-5 py-3 text-[10px] font-black border-2 transition-all uppercase tracking-[0.2em] whitespace-nowrap
                  ${activeSubTab === tab.id
                    ? 'bg-main text-black border-main shadow-[4px_4px_0px_white]'
                    : 'bg-black text-white/40 border-white/20 hover:border-white/40'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* --- RIGHT SIDE: QUEST LIST --- */}
        <div className="md:col-span-9 lg:col-span-10">
          {activeSubTab === 'ACTIVE' ? (
            activeQuest ? (
              <ActiveQuestView
                activeProgress={activeQuest}
                onUpdateProgress={() => { }}
                onComplete={(pid) => handleCompleteQuest(pid)}
                onCancel={(pid) => {
                  setSystemPopup({
                    isOpen: true,
                    title: t('quests.abort_protocol'),
                    message: t('quests.terminate_mission'),
                    type: 'DANGER',
                    onConfirm: async () => {
                      try {
                        await cancelQuest(pid);
                      } catch (err: any) {
                        setSystemPopup({
                          isOpen: true,
                          title: t('quests.protocol_failed'),
                          message: err.message || 'FAILED TO TERMINATE MISSION.',
                          type: 'DANGER'
                        });
                      }
                    }
                  });
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-32 gap-6 border-4 border-dashed border-white/10 rounded-sm">
                <Zap className="w-16 h-16 text-white/5" />
                <p className="text-xs font-black text-white/20 uppercase italic tracking-[0.3em]">
                  {t('quests.no_active')}
                </p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredQuests.map((quest: any) => {
                const isOwner = quest.creatorId === user?.id;
                const isSystem = quest.creatorId === 0;

                return (
                  <div
                    key={quest.id || quest.questId}
                    className="bg-black border-4 border-white p-8 relative overflow-hidden shadow-[10px_10px_0px_white] transition-all hover:-translate-y-2 active:translate-y-1 group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-3">
                        <span className="text-[10px] font-black italic uppercase border-2 border-white px-3 py-1 transform -skew-x-12">
                          [ {quest.rankDifficulty || quest.rank || 'D'}-RANK ]
                        </span>
                        {isSystem && (
                          <span className="text-[10px] font-black italic uppercase bg-main text-black px-3 py-1 transform -skew-x-12 shadow-[2px_2px_0px_white]">
                            {t('quests.tabs.system')}
                          </span>
                        )}
                      </div>
                      {isOwner && !isSystem && (
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingQuest(quest);
                              setIsModalOpen(true);
                            }}
                            className="hover:text-main text-white/20 transition-all p-1"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSystemPopup({
                                isOpen: true,
                                title: t('quests.purge_protocol'),
                                message: t('quests.delete_warning'),
                                type: 'DANGER',
                                onConfirm: async () => {
                                  try {
                                    await deleteCustomQuest(quest.id);
                                  } catch (err: any) {
                                    setSystemPopup({
                                      isOpen: true,
                                      title: 'DELETE FAILED',
                                      message: err.message || 'THE SERVER REJECTED THE DELETION REQUEST.',
                                      type: 'DANGER'
                                    });
                                  }
                                }
                              });
                            }}
                            className="hover:text-red-500 text-white/20 transition-all p-1"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-4xl font-black italic uppercase text-white mb-3 group-hover:text-main transition-colors leading-[0.85] tracking-tighter">
                      {quest.title}
                    </h3>

                    <div className="space-y-2 mb-8 border-l-2 border-white/10 pl-4 py-2">
                      {quest.steps?.map((step: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 text-[11px] text-white/40 font-black uppercase italic tracking-wider">
                          <div className="w-1.5 h-1.5 bg-main rounded-full shadow-[0_0_5px_var(--main-color)]" />
                          {step.exercise?.name || 'Exercise'}: {step.repetitions || step.duration || 0} {step.exercise?.type === 'SECONDS' ? 'SEC' : 'REPS'}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-main" fill="currentColor" />
                          <span className="text-main font-black text-[12px] italic tracking-tighter">EXP+{quest.xpReward}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-500" fill="currentColor" />
                          <span className="text-yellow-500 font-black text-[12px] italic tracking-tighter">GOLD+{quest.goldReward}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!activeQuest) {
                            setSystemPopup({
                              isOpen: true,
                              title: 'INITIALIZE PROTOCOL',
                              message: 'ARE YOU READY TO COMMIT? THIS WILL LOCK YOUR ACTIVE QUEST SLOT UNTIL COMPLETION OR FAILURE.',
                              type: 'INFO',
                              onConfirm: async () => {
                                try {
                                  if (quest.type === 'SYSTEM') {
                                    await startSystemQuest(quest.id || quest.questId);
                                  } else {
                                    await startQuest(quest.id || quest.questId);
                                  }
                                } catch (err: any) {
                                  setSystemPopup({
                                    isOpen: true,
                                    title: 'INITIALIZATION FAILED',
                                    message: err.message || 'FAILED TO COMMENCE MISSION.',
                                    type: 'DANGER'
                                  });
                                }
                              }
                            });
                          } else {
                            setSystemPopup({
                              isOpen: true,
                              title: t('quests.system_overload'),
                              message: 'ONLY ONE ACTIVE QUEST IS PERMITTED. COMPLETE OR FAIL THE CURRENT PROTOCOL FIRST.',
                              type: 'WARNING'
                            });
                          }
                        }}
                        className="bg-white text-black font-black text-[10px] px-6 py-3 transform -skew-x-12 hover:bg-main hover:text-white transition-all border-2 border-black shadow-[4px_4px_0px_var(--main-color)]"
                      >
                        {t('quests.initialize')}
                      </button>
                    </div>

                    <div className="absolute inset-0 bg-main/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          setEditingQuest(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-24 right-8 w-20 h-20 bg-main border-4 border-white shadow-[8px_8px_0px_white] flex items-center justify-center text-black hover:bg-white transition-all z-50 hover:scale-110 active:scale-95 active:shadow-none active:translate-x-1 active:translate-y-1"
      >
        <Plus className="w-10 h-10 font-black" />
      </button>

      <CreateQuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(data) => createCustomQuest(data)}
        initialData={editingQuest}
        onUpdate={(id, data) => updateCustomQuest(id, data)}
      />

      <PopupWindow
        isOpen={!!systemPopup?.isOpen}
        onClose={closePopup}
        title={systemPopup?.title}
        maxWidth={systemPopup?.type === 'REWARDS' ? 'max-w-xs' : 'max-w-sm'}
      >
        <div className="flex flex-col items-center text-center space-y-6">
          {systemPopup?.type === 'REWARDS' ? (
            <>
              <div className="w-24 h-24 bg-main flex items-center justify-center rounded-sm transform rotate-12 shadow-[10px_10px_0px_white] border-4 border-black">
                <Trophy className="w-14 h-14 text-black -rotate-12" />
              </div>

              <div className="space-y-4 w-full">
                <div className="bg-white/5 border-2 border-white/10 p-5 transform -skew-x-6 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-4">
                    <Zap className="w-8 h-8 text-main" fill="currentColor" />
                    <span className="font-black italic uppercase text-[10px] tracking-[0.2em] text-white/40">{t('quests.rewards.xp')}</span>
                  </div>
                  <span className="text-3xl font-black text-main">+{systemPopup.rewards?.xp}</span>
                </div>

                <div className="bg-white/5 border-2 border-white/10 p-5 transform -skew-x-6 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-4">
                    <Coins className="w-8 h-8 text-yellow-500" fill="currentColor" />
                    <span className="font-black italic uppercase text-[10px] tracking-[0.2em] text-white/40">{t('quests.rewards.gold')}</span>
                  </div>
                  <span className="text-3xl font-black text-yellow-500">+{systemPopup.rewards?.gold}</span>
                </div>
              </div>

              <button
                onClick={closePopup}
                className="w-full py-5 bg-white text-black font-black uppercase italic tracking-[0.2em] hover:bg-main hover:text-white transition-all shadow-[6px_6px_0px_var(--main-color)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                {t('quests.rewards.collect')}
              </button>
            </>
          ) : (
            <>
              <div className={`p-5 rounded-sm transform rotate-45 border-4 ${systemPopup?.type === 'DANGER' ? 'border-red-500 bg-red-500/10' : 'border-main bg-main/10'}`}>
                <div className="-rotate-45">
                  {systemPopup?.type === 'DANGER' ? <AlertTriangle className="w-12 h-12 text-red-500" /> : <Info className="w-12 h-12 text-main" />}
                </div>
              </div>
              <p className="text-[11px] font-black uppercase italic tracking-widest text-white leading-relaxed font-mono">
                {systemPopup?.message}
              </p>
              <div className="flex gap-4 w-full pt-4">
                {systemPopup?.onConfirm ? (
                  <>
                    <button
                      onClick={closePopup}
                      className="flex-1 py-4 border-2 border-white/20 text-[10px] font-black uppercase italic hover:bg-white/10 transition-all font-mono"
                    >
                      ABORT
                    </button>
                    <button
                      onClick={() => {
                        systemPopup.onConfirm?.();
                        closePopup();
                      }}
                      className="flex-1 py-4 bg-red-600 text-black text-[10px] font-black uppercase italic hover:bg-red-500 transition-all shadow-[4px_4px_0px_white]"
                    >
                      CONFIRM
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closePopup}
                    className="w-full py-4 bg-main text-black text-[10px] font-black uppercase italic shadow-[4px_4px_0px_white]"
                  >
                    OK
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </PopupWindow>
    </PageLayout>
  );
};

export default QuestsPage;
