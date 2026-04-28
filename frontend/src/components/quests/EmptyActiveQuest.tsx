import { Zap } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

export default function EmptyActiveQuest() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 border-4 border-dashed border-white/10 rounded-sm">
      <Zap className="w-16 h-16 text-white/5" />
      <p className="text-xs font-black text-white/20 uppercase italic tracking-[0.3em]">
        {t('quests.no_active')}
      </p>
    </div>
  );
}
