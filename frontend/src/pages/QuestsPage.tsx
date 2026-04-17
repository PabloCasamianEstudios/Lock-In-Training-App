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
  const { quests, activeQuest, loading, error, startQuest, completeQuest, createCustomQuest, getCustomQuests } = useQuests(user?.id ?? null);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'DAILY' | 'ACTIVE' | 'YOURS'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                ? 'bg-main text-black border-main' 
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
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredQuests.map((quest: any) => (
              <div 
                key={quest.id || quest.questId}
                className="bg-black border-4 border-white p-6 relative overflow-hidden shadow-[10px_10px_0px_white] transition-all hover:translate-y-[-4px] active:translate-y-[2px] cursor-pointer group"
                onClick={() => {
                  if (!activeQuest) startQuest(quest.id || quest.questId);
                  else alert("You can only have one active quest!");
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black italic uppercase border-2 border-white px-2 py-0.5 transform -skew-x-12">
                    [ {quest.rankDifficulty || quest.rank || 'D'}-RANK ] <span className="text-white/40 ml-1">{quest.type || 'Daily'}</span>
                  </span>
                </div>

                <h3 className="text-3xl font-black italic uppercase text-white mb-1 group-hover:text-main transition-colors leading-[0.9]">
                  {quest.title}
                </h3>
                
                <p className="text-xs text-white/40 font-bold uppercase italic mb-4 line-clamp-1">
                  {quest.description || `Complete the sequence of exercises to earn rewards.`}
                </p>

                <div className="flex justify-between items-end mt-6">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-main" fill="currentColor" />
                      <span className="text-main font-black text-xs italic tracking-tighter transition-all group-hover:scale-110">EXP+{quest.xpReward}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-orange-400" fill="currentColor" />
                      <span className="text-orange-400 font-black text-xs italic tracking-tighter transition-all group-hover:scale-110">GOLD+{quest.goldReward}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="text-xs font-black italic text-white/20 mr-2">0 / 1</span>
                     <div className="flex gap-1">
                        <button className="bg-white text-black font-black text-[10px] px-2 py-1 transform -skew-x-12 hover:bg-main hover:text-white transition-colors border border-black shadow-[2px_2px_0_var(--main-color)]">+1</button>
                        <button className="bg-white text-black font-black text-[10px] px-2 py-1 transform -skew-x-12 hover:bg-main hover:text-white transition-colors border border-black shadow-[2px_2px_0_var(--main-color)]">+3</button>
                     </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-main/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-8 w-16 h-16 bg-main border-4 border-white shadow-[6px_6px_0px_white] flex items-center justify-center text-black hover:bg-white transition-all z-50 hover:scale-110 active:scale-95"
      >
        <Plus className="w-8 h-8 font-black" />
      </button>

      <CreateQuestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={(data) => createCustomQuest(data)} 
      />
    </div>
  );
};

export default QuestsPage;

