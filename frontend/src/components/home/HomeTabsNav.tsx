import { useLanguage } from '../../LanguageContext';

export type HomeTabType = 'FEED' | 'ACTIVITY' | 'TIPS' | 'FRIENDS';

interface HomeTabsNavProps {
  activeTab: HomeTabType;
  onTabChange: (tab: HomeTabType) => void;
}

const TABS: HomeTabType[] = ['FEED', 'ACTIVITY', 'TIPS', 'FRIENDS'];

export default function HomeTabsNav({ activeTab, onTabChange }: HomeTabsNavProps) {
  const { t } = useLanguage();

  return (
    <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6 md:mb-4">
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-6 py-2 text-[10px] font-black border-2 transition-all uppercase tracking-[0.2em] whitespace-nowrap
            ${activeTab === tab 
              ? 'bg-main text-neutral-black border-main shadow-[4px_4px_0px_var(--neutral-white)]' 
              : 'bg-neutral-black text-text-secondary border-border hover:border-text-secondary'}`}
        >
          {t(`home.tabs.${tab.toLowerCase()}`)}
        </button>
      ))}
    </nav>
  );
}
