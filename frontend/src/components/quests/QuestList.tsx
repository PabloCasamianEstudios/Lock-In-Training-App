import { Zap, Coins } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface QuestListProps {
  quests: any[];
  userId?: number;
  onEditQuest: (quest: any) => void;
  onDeleteQuest: (questId: number) => void;
  onStartQuest: (quest: any) => void;
}

export default function QuestList({
  quests,
  userId,
  onEditQuest,
  onDeleteQuest,
  onStartQuest
}: QuestListProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {quests.map((quest: any) => {
        const isOwner = quest.creatorId === userId;
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
                {quest.isMandatory && (
                  <span className="text-[10px] font-black italic uppercase bg-red-600 text-white px-3 py-1 transform -skew-x-12 shadow-[2px_2px_0px_white] animate-pulse">
                    MANDATORY
                  </span>
                )}
              </div>
              {isOwner && !isSystem && (
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditQuest(quest);
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
                      onDeleteQuest(quest.id);
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
              {quest.steps && quest.steps.length > 0 ? (
                quest.steps.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-[11px] text-white/40 font-black uppercase italic tracking-wider">
                    <div className="w-1.5 h-1.5 bg-main rounded-full shadow-[0_0_5px_var(--main-color)]" />
                    {step.exercise?.name || 'Exercise'}: {step.repetitions || step.duration || 0} {step.exercise?.type === 'SECONDS' ? 'SEC' : 'REPS'}
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-white/20 italic font-black uppercase tracking-widest">
                  {quest.description || 'NO MISSION DATA'}
                </div>
              )}
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
                onClick={() => onStartQuest(quest)}
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
  );
}
