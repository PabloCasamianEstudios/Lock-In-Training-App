export default function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex justify-around pt-4 pb-8">
        {[1, 0, 2].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`rounded-full bg-white/10 ${i === 0 ? 'w-20 h-20' : 'w-14 h-14'}`} />
            <div className="w-16 h-2 bg-white/10 rounded" />
            <div className="w-12 h-2 bg-white/10 rounded" />
          </div>
        ))}
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="w-6 h-4 bg-white/10 rounded" />
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/10 rounded w-24" />
            <div className="h-2 bg-white/10 rounded w-16" />
          </div>
          <div className="w-12 h-4 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
