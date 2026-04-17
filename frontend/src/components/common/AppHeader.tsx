import { type FC } from 'react';
import { MoreVertical } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  className?: string;
}

const AppHeader: FC<AppHeaderProps> = ({ title, className = '-mx-4 -mt-4 mb-4' }) => {
  return (
    <header className={`flex justify-between items-center bg-black/40 p-4 border-b border-white/10 ${className}`}>
      <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">{title}</h1>
      <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
        <MoreVertical className="w-6 h-6 text-white" />
      </button>
    </header>
  );
};

export default AppHeader;
