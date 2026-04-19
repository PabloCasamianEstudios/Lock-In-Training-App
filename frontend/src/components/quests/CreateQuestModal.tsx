import { useState, type FC, useEffect } from 'react';
import { X, Plus, Trash2, Dumbbell, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExerciseOption {
  id: string;
  name: string;
  type: 'REPS' | 'SECONDS';
}

const MOCKED_EXERCISES: ExerciseOption[] = [
  { id: 'pushups', name: 'PUSH-UPS', type: 'REPS' },
  { id: 'pullups', name: 'PULL-UPS', type: 'REPS' },
  { id: 'squats', name: 'SQUATS', type: 'REPS' },
  { id: 'burpees', name: 'BURPEES', type: 'REPS' },
  { id: 'plank', name: 'PLANK', type: 'SECONDS' },
  { id: 'run', name: 'RUNNING', type: 'SECONDS' },
  { id: 'situps', name: 'SIT-UPS', type: 'REPS' },
];

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  initialData?: any;
  onUpdate?: (id: number, data: any) => void;
}

const CreateQuestModal: FC<CreateQuestModalProps> = ({ isOpen, onClose, onCreate, initialData, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<any[]>([{ name: MOCKED_EXERCISES[0].name, type: MOCKED_EXERCISES[0].type, value: 10 }]);

 

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      if (initialData.steps) {
        setExercises(initialData.steps.map((s: any) => ({
          name: s.exercise?.name || 'PUSH-UPS',
          type: s.exercise?.type === 'SECONDS' ? 'SECONDS' : 'REPS',
          value: s.repetitions || 10
        })));
      }
    } else {
      setTitle('');
      setExercises([{ name: MOCKED_EXERCISES[0].name, type: MOCKED_EXERCISES[0].type, value: 10 }]);
    }
  }, [initialData, isOpen]);

  const addExercise = () => {
    setExercises([...exercises, { name: MOCKED_EXERCISES[0].name, type: MOCKED_EXERCISES[0].type, value: 10 }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const newExercises = [...exercises];
    if (field === 'name') {
      const option = MOCKED_EXERCISES.find(ex => ex.name === value);
      newExercises[index].name = value;
      newExercises[index].type = option?.type || 'REPS';
    } else {
      newExercises[index].value = value;
    }
    setExercises(newExercises);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || exercises.length === 0) return;
    
    const data = {
      title,
      exercises: exercises.map(ex => ({
        name: ex.name,
        [ex.type === 'REPS' ? 'reps' : 'seconds']: Number(ex.value)
      }))
    };

    if (initialData && onUpdate) {
      onUpdate(initialData.id, data);
    } else {
      onCreate(data);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="system-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8 border-b-4 border-main pb-2">
          {initialData ? 'EDIT' : 'NEW'} <span className="text-main">QUEST</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Quest Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.G. MORNING GRIND"
              className="input-neon"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Exercises</label>
              <button 
                type="button"
                onClick={addExercise}
                className="flex items-center gap-1 text-[10px] font-black uppercase text-main hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" /> ADD
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {exercises.map((ex, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-2 items-center"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <select 
                        value={ex.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        className="bg-white text-black font-black uppercase italic text-xs p-2 skew-x-[-10deg] outline-none"
                      >
                        {MOCKED_EXERCISES.map(opt => (
                          <option key={opt.id} value={opt.name}>{opt.name}</option>
                        ))}
                      </select>
                      <div className="relative">
                        <input 
                          type="number"
                          value={ex.value}
                          onChange={(e) => updateExercise(index, 'value', e.target.value)}
                          className="w-full bg-white text-black font-black uppercase italic text-xs p-2 skew-x-[-10deg] outline-none pr-10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-black/40 italic">
                          {ex.type === 'REPS' ? 'REPS' : 'SEC'}
                        </span>
                      </div>
                    </div>
                    {exercises.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="p-2 text-white/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="submit"
              className="button-neon flex-1"
            >
              {initialData ? 'UPDATE PROTOCOL' : 'INITIALIZE PROTOCOL'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateQuestModal;
