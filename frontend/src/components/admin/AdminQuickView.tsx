import { FC } from 'react';
import { Trash2 } from 'lucide-react';

interface AdminQuickViewProps {
  entity: string;
  data: any[];
  onDelete: (id: number) => void;
}

export const AdminQuickView: FC<AdminQuickViewProps> = ({ entity, data, onDelete }) => {
  return (
    <div className="mt-16 group border-4 border-border rounded-sm overflow-hidden bg-neutral-black/40 shadow-2xl">
      <div className="bg-surface p-5 flex items-center justify-between border-b-2 border-border leading-none">
        <span className="font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-3 text-text-secondary opacity-60">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_var(--main-color)]" />
          Quick View: {entity}
        </span>
        <span className="text-[9px] opacity-30 font-mono italic text-text-secondary">Results from 'LIST ALL' execution</span>
      </div>
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-neutral-black/20">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface border-b-2 border-border sticky top-0 z-10 backdrop-blur-xl">
            <tr>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-30">ID</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-30">Preview Data</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-30 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {(data || []).map((item: any) => (
              <tr key={item.id} className="hover:bg-surface transition-all group/row">
                <td className="p-5 font-mono text-[12px] text-orange-500/80 font-black italic">#{item.id}</td>
                <td className="p-5">
                  <div className="text-[10px] text-text-secondary opacity-40 font-mono truncate max-w-lg italic group-hover/row:text-text-main transition-colors">
                    {JSON.stringify(item).substring(0, 100)}...
                  </div>
                </td>
                <td className="p-5 text-right">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-neutral-black px-4 py-2 rounded-sm transition-all duration-300 opacity-0 group-hover/row:opacity-100 border-2 border-red-600/30 transform -skew-x-12"
                    title="Quick Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(data && data.length === 0) && (
              <tr><td colSpan={3} className="p-20 text-center text-text-secondary opacity-10 italic text-[11px] tracking-[0.4em] uppercase font-black">Select an operation above and click EXECUTE to browse data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
