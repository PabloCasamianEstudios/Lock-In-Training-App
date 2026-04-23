import { type FC, type ComponentType } from 'react';

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
  const parts = title.split(' ');
  const mainTitle = parts.slice(0, -1).join(' ');
  const lastWord = parts[parts.length - 1];

  return (
    <header className={`flex items-center gap-4 border-b-4 border-white pb-6 ${className}`}>
      {Icon && (
        <Icon className="w-10 h-10 text-main drop-shadow-[0_0_10px_var(--main-glow)]" />
      )}
      <div className="flex flex-col">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
          {mainTitle} <span className="text-main text-glow">{lastWord}</span>
        </h1>
        {subtitle && (
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic mt-1">
            {subtitle}
          </span>
        )}
      </div>
      
      {showStatus && (
        <div className="ml-auto hidden sm:flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 skew-x-[-15deg]">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50 skew-x-[15deg]">System Online</span>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
