import { useLanguage } from '../../LanguageContext';

export type RankingTabType = 'ALL' | 'FRIENDS' | 'YOUR_LEAGUE';

interface RankingsTabsNavProps {
  activeTab: RankingTabType;
  setActiveTab: (tab: RankingTabType) => void;
}

export default function RankingsTabsNav({ activeTab, setActiveTab }: RankingsTabsNavProps) {
  const { t } = useLanguage();
  
  const SUB_TABS = [
    { id: 'ALL' as const, label: t('rankings.tabs.all') },
    { id: 'FRIENDS' as const, label: t('rankings.tabs.friends') },
    { id: 'YOUR_LEAGUE' as const, label: t('rankings.tabs.league') },
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-8 border-b border-border mb-10">
      {SUB_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-2 text-[10px] font-black border-2 transition-all uppercase tracking-[0.2em] whitespace-nowrap
            ${activeTab === tab.id
              ? 'bg-main text-neutral-black border-main shadow-[4px_4px_0px_var(--neutral-white)]'
              : 'bg-neutral-black text-text-secondary border-border hover:border-text-secondary'}`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
