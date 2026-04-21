import { useState, type FC, useMemo } from 'react';
import { useQuests } from '../../hooks/useQuests';
import { Plus, Search, Zap, Coins, Info, AlertTriangle, Trophy } from 'lucide-react';
import type { PageProps, Quest } from '../../types';
import CreateQuestModal from '../../components/quests/CreateQuestModal';
import ActiveQuestView from '../../components/quests/ActiveQuestView';
import AppHeader from '../../components/common/AppHeader';
import PopupWindow from '../../components/common/PopupWindow';
import BrutalistCard from '../../components/common/BrutalistCard';

interface QuestsPageProps extends PageProps {
  onNavigate?: (tab: string, params?: any) => void;
  fetchProfile?: (userId: number) => Promise<any>;
}

const QuestsPage: FC<QuestsPageProps> = ({ user, profile, onNavigate, fetchProfile }) => {
  const { quests, activeQuest, loading, error, startQuest, cancelQuest, completeQuest, createCustomQuest, updateCustomQuest, deleteCustomQuest, getCustomQuests } = useQuests(user?.id ?? null);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'DAILY' | 'ACTIVE' | 'YOURS'>('ALL');
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
  const allQuestsCount = dailyQuests.length + customQuests.length;
  const dailyQuestsCount = dailyQuests.length;
  const yoursQuestsCount = customQuests.length;
  const activeQuestsCount = activeQuest ? 1 : 0;

  const handleCompleteQuest = async (id: number) => {
    try {
      const response: any = await completeQuest(id);
      setSystemPopup({
        isOpen: true,
        title: 'PROTOCOL SUCCESSFUL',
        type: 'REWARDS',
        rewards: {
          gold: response?.goldReward || 0,
          xp: response?.xpReward || 0
        }
      });
      // Sincronizamos el perfil global para que el modal de Level Up se active
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
      case 'YOURS': return customQuests;
      case 'ALL': return [...dailyQuests, ...customQuests];
      default: return [];
    }
  }, [activeSubTab, dailyQuests, customQuests]);

  if (loading) return <div className="p-10 text-main animate-pulse font-black uppercase text-xl text-center mt-20">INITIALIZING QUEST PROTOCOL...</div>;
  if (error) return <div className="p-10 text-red-500 uppercase font-black text-center mt-20 border-4 border-red-500 bg-red-500/10">Error: {error}</div>;

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 relative min-h-screen">
      
      <AppHeader title="QUESTS" />

      <nav className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-2 px-6 mb-8">
        {[
          { id: 'ALL', label: `ALL (${allQuestsCount})` },
          { id: 'DAILY', label: `DAILY (${dailyQuestsCount})` },
          { id: 'ACTIVE', label: `ACTIVE (${activeQuestsCount})` },
          { id: 'YOURS', label: `YOURS (${yoursQuestsCount})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-1.5 text-[10px] font-black border-2 transition-all uppercase tracking-widest whitespace-nowrap
              ${activeSubTab === tab.id 
                ? 'bg-main text-black border-main shadow-[4px_4px_0px_white]' 
                : 'bg-black text-white/40 border-white/20 hover:border-white/40'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="px-6 space-y-6">
        {activeSubTab === 'ACTIVE' ? (
          activeQuest ? (
            <ActiveQuestView 
              activeProgress={activeQuest} 
              onUpdateProgress={() => {}} 
              onComplete={(pid) => handleCompleteQuest(pid)} 
              onCancel={(pid) => {
                setSystemPopup({
                  isOpen: true,
                  title: 'ABORT PROTOCOL',
                  message: 'ARE YOU SURE YOU WANT TO TERMINATE THIS MISSION? ALL CURRENT EXPERIMENT DATA WILL BE PURGED.',
                  type: 'DANGER',
                  onConfirm: () => cancelQuest(pid)
                });
              }}
            />
          ) : (
            <div className="text-center py-20 text-white/20 font-black italic uppercase tracking-widest border-2 border-dashed border-white/10">
              No active quests in progress
            </div>
          )
        ) : (
          <div className="grid gap-6">
            {filteredQuests.map((quest: any) => {
              const isOwner = quest.creatorId === user?.id;
              const isSystem = quest.creatorId === 0;
              
              return (
                <div 
                  key={quest.id || quest.questId}
                  className="bg-black border-4 border-white p-6 relative overflow-hidden shadow-[10px_10px_0px_white] transition-all hover:translate-y-[-4px] active:translate-y-[2px] group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                       <span className="text-[10px] font-black italic uppercase border-2 border-white px-2 py-0.5 transform -skew-x-12">
                        [ {quest.rankDifficulty || quest.rank || 'D'}-RANK ]
                      </span>
                      {isSystem && (
                        <span className="text-[10px] font-black italic uppercase bg-main text-black px-2 py-0.5 transform -skew-x-12">
                          SYSTEM
                        </span>
                      )}
                    </div>
                    {isOwner && !isSystem && (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingQuest(quest);
                            setIsModalOpen(true);
                          }}
                          className="hover:text-main text-white/40 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSystemPopup({
                              isOpen: true,
                              title: 'PURGE PROTOCOL',
                              message: 'YOU ARE ABOUT TO DELETE THIS QUEST. THIS ACTION CANNOT BE UNDONE. PROCEED?',
                              type: 'DANGER',
                              onConfirm: () => deleteCustomQuest(quest.id)
                            });
                          }}
                          className="hover:text-red-500 text-white/40 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-3xl font-black italic uppercase text-white mb-2 group-hover:text-main transition-colors leading-[0.9]">
                    {quest.title}
                  </h3>
                  
                  <div className="space-y-1 mb-6">
                    {quest.steps?.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-[10px] text-white/60 font-black uppercase italic">
                        <div className="w-1 h-1 bg-main rounded-full" />
                        {step.exercise?.name || 'Exercise'}: {step.repetitions} {step.exercise?.type === 'SECONDS' ? 'SEC' : 'REPS'}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-main" fill="currentColor" />
                        <span className="text-main font-black text-xs italic">EXP+{quest.xpReward}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-orange-400" fill="currentColor" />
                        <span className="text-orange-400 font-black text-xs italic">GOLD+{quest.goldReward}</span>
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
                            onConfirm: () => startQuest(quest.id || quest.questId)
                          });
                        } else {
                          setSystemPopup({
                            isOpen: true,
                            title: 'SYSTEM OVERLOAD',
                            message: 'ONLY ONE ACTIVE QUEST IS PERMITTED. COMPLETE OR FAIL THE CURRENT PROTOCOL FIRST.',
                            type: 'WARNING'
                          });
                        }
                      }}
                      className="bg-white text-black font-black text-xs px-4 py-2 transform -skew-x-12 hover:bg-main hover:text-white transition-all border-2 border-black"
                    >
                      INITIALIZE
                    </button>
                  </div>

                  <div className="absolute inset-0 bg-main/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button 
        onClick={() => {
          setEditingQuest(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-24 right-8 w-16 h-16 bg-main border-4 border-white shadow-[6px_6px_0px_white] flex items-center justify-center text-black hover:bg-white transition-all z-50 hover:scale-110 active:scale-95"
      >
        <Plus className="w-8 h-8 font-black" />
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
              <div className="w-20 h-20 bg-main flex items-center justify-center rounded-sm transform rotate-12 shadow-[8px_8px_0px_white]">
                <Trophy className="w-12 h-12 text-black -rotate-12" />
              </div>
              
              <div className="space-y-4 w-full">
                <div className="bg-white/5 border-2 border-white/10 p-4 transform -skew-x-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-main" />
                    <span className="font-black italic uppercase text-xs tracking-widest text-white/50">Experience</span>
                  </div>
                  <span className="text-2xl font-black text-main">+{systemPopup.rewards?.xp}</span>
                </div>

                <div className="bg-white/5 border-2 border-white/10 p-4 transform -skew-x-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6 text-yellow-500" />
                    <span className="font-black italic uppercase text-xs tracking-widest text-white/50">Coins Gained</span>
                  </div>
                  <span className="text-2xl font-black text-yellow-500">+{systemPopup.rewards?.gold}</span>
                </div>
              </div>

              <button 
                onClick={closePopup}
                className="w-full py-4 bg-white text-black font-black uppercase italic tracking-widest hover:bg-main transition-all"
              >
                COLLECT & CONTINUE
              </button>
            </>
          ) : (
            <>
              <div className={`p-4 rounded-full ${systemPopup?.type === 'DANGER' ? 'bg-red-500/20 text-red-500' : 'bg-main/20 text-main'}`}>
                {systemPopup?.type === 'DANGER' ? <AlertTriangle className="w-12 h-12" /> : <Info className="w-12 h-12" />}
              </div>
              <p className="text-xs font-black uppercase italic tracking-widest text-white/70 leading-relaxed">
                {systemPopup?.message}
              </p>
              <div className="flex gap-4 w-full">
                {systemPopup?.onConfirm ? (
                  <>
                    <button 
                      onClick={closePopup}
                      className="flex-1 py-3 border-2 border-white/20 text-[10px] font-black uppercase italic hover:bg-white/10 transition-all"
                    >
                      ABORT
                    </button>
                    <button 
                      onClick={() => {
                        systemPopup.onConfirm?.();
                        closePopup();
                      }}
                      className="flex-1 py-3 bg-red-600 text-black text-[10px] font-black uppercase italic hover:bg-red-500 transition-all"
                    >
                      CONFIRM
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={closePopup}
                    className="w-full py-3 bg-main text-black text-[10px] font-black uppercase italic"
                  >
                    ACKNOWLEDGED
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </PopupWindow>
    </div>
  );
};

export default QuestsPage;





