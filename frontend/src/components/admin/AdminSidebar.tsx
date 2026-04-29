import { FC } from 'react';
import { ENTITIES } from './constants';

interface AdminSidebarProps {
  selectedEntity: string;
  onSelectEntity: (id: string) => void;
}

export const AdminSidebar: FC<AdminSidebarProps> = ({ selectedEntity, onSelectEntity }) => {
  return (
    <div className="lg:col-span-1 flex flex-col gap-3">
      <label className="text-[10px] font-black uppercase text-text-secondary opacity-30 mb-2 tracking-[0.3em] italic border-l-4 border-orange-500 pl-4">Repositories</label>
      {ENTITIES.map(e => (
        <button
          key={e.id}
          onClick={() => onSelectEntity(e.id)}
          className={`p-4 text-left text-[11px] font-black uppercase tracking-[0.2em] transition-all skew-x-[-15deg] border-2 group relative overflow-hidden ${selectedEntity === e.id
            ? 'bg-orange-500 border-orange-500 text-neutral-black shadow-[6px_6px_0_var(--neutral-white)]'
            : 'border-border text-text-secondary opacity-40 hover:opacity-100 hover:border-text-secondary hover:text-text-main bg-surface'
            }`}
        >
          <span className="relative z-10 skew-x-[15deg] inline-block">{e.name}</span>
          {selectedEntity === e.id && (
            <div className="absolute top-0 left-[-100%] w-full h-full bg-white/20 skew-x-[45deg] animate-[shine_2s_infinite]" />
          )}
        </button>
      ))}
    </div>
  );
};
