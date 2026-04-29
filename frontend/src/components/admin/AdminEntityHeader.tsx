import { FC } from 'react';

interface AdminEntityHeaderProps {
  entity: string;
}

export const AdminEntityHeader: FC<AdminEntityHeaderProps> = ({ entity }) => {
  return (
    <div className="flex flex-col mb-10 gap-2 border-b-2 border-border pb-6">
      <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-text-main">{entity}</h2>
      <div className="flex items-center gap-3 text-[10px] opacity-100 font-mono italic mt-2">
        <span className="bg-surface px-2 py-0.5 rounded-sm text-text-secondary opacity-40">ENDPOINT BASE</span>
        <span className="text-orange-500 font-bold">/api/admin/{entity}</span>
      </div>
    </div>
  );
};
