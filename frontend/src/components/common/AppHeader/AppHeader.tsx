import { type FC, type ComponentType } from 'react';
import { useLanguage } from '../../../LanguageContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  showStatus?: boolean;
}

const AppHeader: FC<AppHeaderProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  className = 'mb-10',
  showStatus = true 
}) => {
  const { t } = useLanguage();
  const parts = title.split(' ');
  const mainTitle = parts.slice(0, -1).join(' ');
  const lastWord = parts[parts.length - 1];

  return (
    <header className={`flex items-center gap-3 sm:gap-4 border-b-4 border-neutral-white pb-4 sm:pb-6 ${className.includes('mb-10') ? 'mb-6 sm:mb-10' : className}`}>
      {Icon && (
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-main drop-shadow-[0_0_10px_var(--main-glow)] flex-shrink-0" />
      )}
      <div className="flex flex-col min-w-0">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none truncate">
          {mainTitle} <span className="text-main text-glow">{lastWord}</span>
        </h1>
        {subtitle && (
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary italic mt-1 truncate">
            {subtitle}
          </span>
        )}
      </div>
      
      {showStatus && (
        <div className="ml-auto hidden sm:flex items-center gap-2 px-4 py-1 bg-surface border border-border skew-x-[-15deg]">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary skew-x-[15deg]">
            {t('common.system_online')}
          </span>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
