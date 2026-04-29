import { Check, Flame } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface FeedTabProps {
  dailyQuests: any[];
}

export default function FeedTab({ dailyQuests }: FeedTabProps) {
  const { t } = useLanguage();
  const pendingQuests = dailyQuests.filter(q => !q.completed);

  return (
    <div className="space-y-6">
      {pendingQuests.map((quest, i) => (
        <div key={quest.id || i} className="bg-neutral-black border-4 border-neutral-white p-8 relative overflow-hidden shadow-[12px_12px_0px_var(--neutral-white)] group hover:border-main transition-all hover:-translate-y-1">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-main/5 text-main/5 rounded-full blur-3xl group-hover:bg-main/20 transition-all" />
          <div className="relative z-10">
            <h3 className="text-4xl font-black italic tracking-tighter text-text-main leading-none mb-3 uppercase group-hover:text-main transition-colors">{quest.title}</h3>
            <p className="text-xs text-text-secondary opacity-60 leading-relaxed italic uppercase font-bold mb-8 border-l-2 border-border pl-4">
              {quest.description || 'System-assigned daily protocol'}
            </p>
            <div className="flex justify-between items-end">
              <div className="flex gap-6">
                <span className="text-[10px] font-black text-main tracking-[0.2em] italic flex items-center gap-2 bg-main/10 px-3 py-1 rounded-sm border border-main/20">
                  <Flame className="w-4 h-4" />
                  EXP +{quest.xpReward}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-black text-text-secondary opacity-20 uppercase mb-1">PROGRESION</span>
                <span className="text-[12px] font-black text-text-main italic tracking-widest">{quest.completedRepetitions || 0} / {quest.totalRepetitions || 1} REPS</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {pendingQuests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border-4 border-dashed border-border rounded-sm">
          <Check className="w-12 h-12 text-main opacity-20" />
          <p className="text-xs font-black text-text-secondary opacity-20 uppercase tracking-[0.3em] italic text-center">{t('home.no_pending')}</p>
        </div>
      )}
    </div>
  );
}
