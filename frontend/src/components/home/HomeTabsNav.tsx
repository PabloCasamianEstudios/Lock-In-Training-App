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
              ? 'bg-main text-black border-main shadow-[4px_4px_0px_white]' 
              : 'bg-black text-white/40 border-white/10 hover:border-white/40'}`}
        >
          {t(`home.tabs.${tab.toLowerCase()}`)}
        </button>
      ))}
    </nav>
  );
}
