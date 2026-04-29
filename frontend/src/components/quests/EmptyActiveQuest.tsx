import { Zap } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

export default function EmptyActiveQuest() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 border-4 border-dashed border-border rounded-sm bg-neutral-black">
      <Zap className="w-16 h-16 text-text-secondary" />
      <p className="text-xs font-black text-text-secondary uppercase italic tracking-[0.3em]">
        {t('quests.no_active')}
      </p>
    </div>
  );
}
