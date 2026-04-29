import { Lightbulb } from 'lucide-react';

interface TipsTabProps {
  tips: { title: string, description: string }[];
}

export default function TipsTab({ tips }: TipsTabProps) {
  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
      {tips.map((tip, i) => (
        <div key={i} className="bg-neutral-black border-2 border-border p-6 relative group hover:border-main transition-all shadow-[6px_6px_0px_var(--border)] hover:shadow-[6px_6px_0px_var(--main-color)] hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-main/10 rounded-full">
              <Lightbulb className="w-5 h-5 text-main" />
            </div>
            <h4 className="text-[11px] font-black text-text-main uppercase italic tracking-widest">{tip.title}</h4>
          </div>
          <p className="text-xs text-text-secondary opacity-40 leading-relaxed italic font-medium">{tip.description}</p>
        </div>
      ))}
    </div>
  );
}
