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
            className="bg-neutral-black border-4 border-neutral-white p-5 sm:p-8 relative overflow-hidden shadow-[6px_6px_0px_var(--neutral-white)] sm:shadow-[10px_10px_0px_var(--neutral-white)] transition-all hover:-translate-y-2 active:translate-y-1 group"
          >
            <div className="flex justify-between items-start mb-4 sm:mb-6 gap-2">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <span className="text-[9px] sm:text-[10px] font-black italic uppercase border-2 border-border px-2 sm:px-3 py-1 transform -skew-x-12 text-text-main">
                  [ {quest.rankDifficulty || quest.rank || 'D'}-RANK ]
                </span>
                {isSystem && (
                  <span className="text-[9px] sm:text-[10px] font-black italic uppercase bg-main text-neutral-black px-2 sm:px-3 py-1 transform -skew-x-12 shadow-[2px_2px_0px_var(--neutral-white)]">
                    {t('quests.tabs.system')}
                  </span>
                )}
                {quest.isMandatory && (
                  <span className="text-[9px] sm:text-[10px] font-black italic uppercase bg-red-600 text-white px-2 sm:px-3 py-1 transform -skew-x-12 shadow-[2px_2px_0px_var(--neutral-white)] animate-pulse">
                    {t('common.mandatory')}
                  </span>
                )}
              </div>
              {isOwner && !isSystem && (
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditQuest(quest);
                    }}
                    className="hover:text-main text-text-secondary opacity-20 transition-all p-1"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuest(quest.id);
                    }}
                    className="hover:text-red-500 text-text-secondary opacity-20 transition-all p-1"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-2xl sm:text-4xl font-black italic uppercase text-text-main mb-3 group-hover:text-main transition-colors leading-[0.85] tracking-tighter truncate sm:whitespace-normal">
              {quest.title}
            </h3>

            <div className="space-y-2 mb-6 sm:mb-8 border-l-2 border-white/10 pl-4 py-2">
              {quest.steps && quest.steps.length > 0 ? (
                quest.steps.slice(0, 3).map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-[10px] sm:text-[11px] text-text-secondary opacity-40 font-black uppercase italic tracking-wider truncate">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 flex-shrink-0 bg-main rounded-full shadow-[0_0_5px_var(--main-color)]" />
                    <span className="truncate">{step.exercise?.name || 'Exercise'}: {step.repetitions || step.duration || 0} {step.exercise?.type === 'SECONDS' ? 'SEC' : 'REPS'}</span>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-text-secondary opacity-20 italic font-black uppercase tracking-widest truncate">
                  {quest.description || 'NO MISSION DATA'}
                </div>
              )}
              {quest.steps && quest.steps.length > 3 && (
                <div className="text-[8px] text-main font-black uppercase italic opacity-40">+ {quest.steps.length - 3} {t('quests.more_tasks')}</div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="flex gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-main" fill="currentColor" />
                  <span className="text-main font-black text-[11px] sm:text-[12px] italic tracking-tighter">EXP+{quest.xpReward}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" />
                  <span className="text-yellow-500 font-black text-[11px] sm:text-[12px] italic tracking-tighter">{t('quests.gold')}+{quest.goldReward}</span>
                </div>
              </div>

              <button
                onClick={() => onStartQuest(quest)}
                className="w-full sm:w-auto bg-neutral-white text-neutral-black font-black text-[10px] px-6 py-3 transform -skew-x-12 hover:bg-main hover:text-neutral-black transition-all border-2 border-neutral-black shadow-[4px_4px_0px_var(--main-color)]"
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
