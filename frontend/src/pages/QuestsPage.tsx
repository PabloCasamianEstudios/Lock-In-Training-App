import { useState, type FC, useMemo } from 'react';
import { useQuests } from '../hooks/useQuests';
import { Plus, Search, Zap, Coins } from 'lucide-react';
import type { PageProps } from '../types';
import CreateQuestModal from '../components/quests/CreateQuestModal';
import ActiveQuestView from '../components/quests/ActiveQuestView';
import AppHeader from '../components/common/AppHeader';

interface QuestsPageProps extends PageProps {
  onNavigate?: (tab: string, params?: any) => void;
}

const QuestsPage: FC<QuestsPageProps> = ({ user, onNavigate }) => {
  const { quests, activeQuest, loading, error, startQuest, completeQuest, createCustomQuest, updateCustomQuest, deleteCustomQuest, getCustomQuests } = useQuests(user?.id ?? null);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'DAILY' | 'ACTIVE' | 'YOURS'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<any | null>(null);

  const customQuests = useMemo(() => getCustomQuests(), [getCustomQuests]);

  const allQuestsCount = quests.length + customQuests.length;
  const dailyQuestsCount = quests.length;
  const activeQuestsCount = activeQuest ? 1 : 0;
  const yoursQuestsCount = customQuests.length;

  const filteredQuests = useMemo(() => {
    switch (activeSubTab) {
      case 'DAILY': return quests;
      case 'YOURS': return customQuests;
      case 'ALL': return [...quests, ...customQuests];
      default: return [];
    }
  }, [activeSubTab, quests, customQuests]);

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
              onComplete={(pid) => completeQuest(pid)} 
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
                            if(confirm('Are you sure you want to delete this quest?')) deleteCustomQuest(quest.id);
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
                        if (!activeQuest) startQuest(quest.id || quest.questId);
                        else alert("You can only have one active quest!");
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
    </div>
  );
};

export default QuestsPage;

