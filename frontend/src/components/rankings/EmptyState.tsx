import { Trophy } from 'lucide-react';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-main/10 blur-2xl" />
        <Trophy className="w-12 h-12 text-white/10 relative" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20 italic">{message}</p>
    </div>
  );
}
