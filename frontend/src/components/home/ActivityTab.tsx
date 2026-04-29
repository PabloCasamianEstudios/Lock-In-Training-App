import { Activity as ActivityIcon } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface ActivityTabProps {
  activity: any[];
}

export default function ActivityTab({ activity }: ActivityTabProps) {
  const { t } = useLanguage();

  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
      {activity.length > 0 ? (
        activity.slice(0, 10).map((act, i) => (
          <div key={i} className="bg-neutral-black border-2 border-border p-5 flex items-center justify-between group hover:border-main/40 transition-all hover:bg-surface">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface border-2 border-border rounded-sm group-hover:bg-main/10 transition-colors">
                <ActivityIcon className="w-5 h-5 text-text-main group-hover:text-main transition-colors" />
              </div>
              <div>
                <p className="text-[11px] font-black text-text-main uppercase italic tracking-wider">{act.title ?? 'Quest'}</p>
                <p className="text-[9px] text-text-main font-black uppercase tracking-[0.2em] mt-1">
                  {act.completionTime ? new Date(act.completionTime).toLocaleDateString() : 'In progress'}
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-main italic">+{act.xpReward ?? 0} XP</span>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-20 text-text-secondary opacity-20 italic font-black uppercase tracking-widest border-2 border-dashed border-border">
          {t('home.no_activity')}
        </div>
      )}
    </div>
  );
}
