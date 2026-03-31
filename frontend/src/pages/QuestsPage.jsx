import { useQuests } from '../hooks/useQuests';
import { Scroll, CheckCircle2, Circle } from 'lucide-react';

const QuestsPage = ({ user }) => {
  const { quests, loading, error } = useQuests(user?.id);

  if (loading) return <div className="p-10 text-main animate-pulse">LOADING PROTOCOL...</div>;
  if (error) return <div className="p-10 text-red-500 uppercase font-black">Error: {error}</div>;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4 border-b-2 border-main pb-4">
        <Scroll className="w-8 h-8 text-main" />
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">DAILY <span className="text-main">QUESTS</span></h1>
      </div>

      <div className="grid gap-6">
        {quests.map((quest) => (
          <div 
            key={quest.questId} 
            className={`system-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 ${quest.completed ? 'opacity-60 grayscale' : 'border-main'}`}
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                {quest.completed ? <CheckCircle2 className="w-6 h-6 text-main" /> : <Circle className="w-6 h-6 text-white/20" />}
                <h3 className="text-2xl font-black italic uppercase text-white">{quest.title}</h3>
                <span className="bg-main text-black px-2 py-0.5 text-[10px] font-black transform -skew-x-12">RANK {quest.rank}</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {quest.exercises.map((ex, i) => (
                  <span key={i} className="text-xs font-black uppercase text-white/40 italic">
                    {ex.exerciseName}: {ex.series}x{ex.repetitionsPerSeries}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-white/40">Reward</div>
                <div className="text-main font-black italic">+{quest.xpReward} XP / +{quest.goldReward} G</div>
              </div>
              <div className="w-32 bg-white/5 h-2 transform -skew-x-12 overflow-hidden border border-white/10">
                <div 
                  className="bg-main h-full transition-all duration-1000" 
                  style={{ width: `${(quest.completedRepetitions / quest.totalRepetitions) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestsPage;
