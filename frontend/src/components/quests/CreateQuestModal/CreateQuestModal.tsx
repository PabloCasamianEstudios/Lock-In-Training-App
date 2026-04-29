import { useState, type FC, useEffect, useRef } from 'react';
import { Plus, Trash2, Download, FileUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PopupWindow from '../../common/PopupWindow';
import { useLanguage } from '../../../LanguageContext';

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
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<any[]>([{ name: MOCKED_EXERCISES[0].name, type: MOCKED_EXERCISES[0].type, value: 10 }]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = () => {
    const questData = {
      title,
      steps: exercises.map(ex => ({
        exercise: { name: ex.name, type: ex.type },
        repetitions: ex.value
      }))
    };
    const dataStr = JSON.stringify(questData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quest_${title.replace(/\s+/g, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.title) setTitle(json.title);
        if (json.steps && Array.isArray(json.steps)) {
          setExercises(json.steps.map((s: any) => ({
            name: s.exercise?.name || 'PUSH-UPS',
            type: s.exercise?.type || 'REPS',
            value: s.repetitions || 10
          })));
        }
      } catch (err) {
        console.error('Error parsing quest JSON:', err);
        alert('Invalid quest file');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  return (
    <PopupWindow
      isOpen={isOpen}
      onClose={onClose}
      title={`${initialData ? t('quest_modal.edit') : t('quest_modal.new')} ${t('quest_modal.protocol')}`}
      maxWidth="max-w-md"
    >
      <div className="flex justify-end gap-3 mb-4 -mt-2">
        {initialData ? (
          <button 
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 text-[9px] font-black uppercase italic bg-surface border border-border px-3 py-1.5 hover:bg-neutral-white hover:text-neutral-black transition-all text-text-secondary"
          >
            <Download className="w-3 h-3" /> EXPORT JSON
          </button>
        ) : (
          <>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-[9px] font-black uppercase italic bg-surface border border-border px-3 py-1.5 hover:bg-neutral-white hover:text-neutral-black transition-all text-text-secondary"
            >
              <FileUp className="w-3 h-3" /> IMPORT JSON
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-main opacity-40 italic">{t('quest_modal.title')}</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('quest_modal.title_placeholder')}
            className="input-neon text-sm"
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-main opacity-40 italic">{t('quest_modal.exercises')}</label>
            <button 
              type="button"
              onClick={addExercise}
              className="flex items-center gap-1 text-[10px] font-black uppercase text-main hover:text-text-main transition-colors underline underline-offset-4 decoration-2"
            >
              <Plus className="w-3 h-3" /> {t('quest_modal.add_new')}
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {exercises.map((ex, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex gap-2 items-center bg-white/5 p-2 border border-white/10"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <select 
                      value={ex.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      className="bg-neutral-black text-text-main font-black uppercase italic text-[10px] p-2 outline-none border border-border"
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
                        className="w-full bg-neutral-black text-text-main font-black uppercase italic text-[10px] p-2 outline-none border border-border pr-10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-text-main opacity-40 italic">
                        {ex.type === 'REPS' ? 'REPS' : 'SEC'}
                      </span>
                    </div>
                  </div>
                  {exercises.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="p-2 text-text-secondary opacity-20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            className="w-full bg-main text-black font-black py-4 uppercase italic tracking-widest text-sm hover:bg-neutral-white hover:text-neutral-black hover:border-neutral-black transition-all shadow-[6px_6px_0px_var(--border)] hover:shadow-[6px_6px_0px_var(--main-color)]"
          >
            {initialData ? t('quest_modal.update') : t('quest_modal.initialize')}
          </button>
        </div>
      </form>
    </PopupWindow>
  );
};

export default CreateQuestModal;




