import { Users } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  username: string;
  size?: string;
  className?: string;
}

export default function Avatar({ src, username, size = 'w-14 h-14', className = '' }: AvatarProps) {
  return (
    <div className={`${size} rounded-full border-2 border-white bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}>
      {src
        ? <img src={src} alt={username} className="w-full h-full object-cover" />
        : <Users className="w-1/2 h-1/2 text-white/30" />}
    </div>
  );
}
