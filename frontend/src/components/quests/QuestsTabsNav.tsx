import { useLanguage } from '../../LanguageContext';

export type QuestTabType = 'ALL' | 'DAILY' | 'ACTIVE' | 'YOURS' | 'SYSTEM';

interface QuestsTabsNavProps {
  activeSubTab: QuestTabType;
  setActiveSubTab: (tab: QuestTabType) => void;
  counts: {
    system: number;
    daily: number;
    active: number;
    yours: number;
  };
}

export default function QuestsTabsNav({ activeSubTab, setActiveSubTab, counts }: QuestsTabsNavProps) {
  const { t } = useLanguage();

  const TABS = [
    { id: 'ALL', label: t('quests.tabs.all') },
    { id: 'SYSTEM', label: `${t('quests.tabs.system')} (${counts.system})` },
    { id: 'DAILY', label: `${t('quests.tabs.daily')} (${counts.daily})` },
    { id: 'ACTIVE', label: `${t('quests.tabs.active')} (${counts.active})` },
    { id: 'YOURS', label: `${t('quests.tabs.yours')} (${counts.yours})` },
  ] as const;

  return (
    <aside className="md:col-span-3 lg:col-span-2 space-y-4 md:sticky md:top-4">
      <h3 className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-40 italic mb-6 border-l-4 border-main pl-3">
        {t('quests.protocols')}
      </h3>
      <nav className="flex md:flex-col flex-wrap md:flex-nowrap items-center gap-2 py-2 md:py-0 mb-4 md:mb-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as QuestTabType)}
            className={`flex-1 md:w-full text-center md:text-left px-2 sm:px-5 py-2 sm:py-3 text-[7px] sm:text-[10px] font-black border-2 transition-all uppercase tracking-[0.1em] sm:tracking-[0.2em]
              ${activeSubTab === tab.id
                ? 'bg-main text-neutral-black border-main shadow-[2px_2px_0px_var(--neutral-white)] sm:shadow-[4px_4px_0px_var(--neutral-white)]'
                : 'bg-neutral-black text-text-secondary border-border hover:border-text-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
