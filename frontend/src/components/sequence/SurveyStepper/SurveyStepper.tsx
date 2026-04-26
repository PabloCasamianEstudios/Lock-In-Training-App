import { useState, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Target, Activity, Ruler, Dumbbell, X } from 'lucide-react';
import { SurveyData } from '../../../types';
import { useLanguage } from '../../../LanguageContext';

interface Step {
  id: string;
  title: string;
  icon: any;
}

const steps: Step[] = [
  { id: 'biometry', title: 'CONTAINER', icon: Ruler },
  { id: 'performance', title: 'CAPACITY', icon: Activity },
  { id: 'frequency', title: 'TUNING', icon: Dumbbell },
  { id: 'goal', title: 'OBJECTIVE', icon: Target }
];

interface SurveyStepperProps {
  onComplete: (data: SurveyData) => void;
  onLogout: () => void;
}

const SurveyStepper: FC<SurveyStepperProps> = ({ onComplete, onLogout }) => {
  const { t } = useLanguage();

  const steps: Step[] = [
    { id: 'biometry', title: t('survey.steps.container'), icon: Ruler },
    { id: 'performance', title: t('survey.steps.capacity'), icon: Activity },
    { id: 'frequency', title: t('survey.steps.tuning'), icon: Dumbbell },
    { id: 'goal', title: t('survey.steps.objective'), icon: Target }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SurveyData>({
    gender: '',
    age: '',
    weight: '',
    height: '',
    pushUps: '',
    runTime: '',
    frequency: '',
    goal: ''
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (field: keyof SurveyData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                              { label: t('survey.fields.gender'), field: 'gender' as const, type: 'select', opts: [{v:'M', l: t('survey.fields.male')}, {v:'F', l: t('survey.fields.female')}, {v:'O', l: t('survey.fields.other')}] },
                { label: t('survey.fields.age'), field: 'age' as const, type: 'number', placeholder: '24' },
                { label: t('survey.fields.weight'), field: 'weight' as const, type: 'number', placeholder: '85' },
                { label: t('survey.fields.height'), field: 'height' as const, type: 'number', placeholder: '185' }
              ].map(item => (
                <div key={item.field} className="space-y-3">
                  <label className="text-sm font-black italic text-white uppercase tracking-widest">{item.label}</label>
                  {item.type === 'select' ? (
                    <div className="relative">
                      <select 
                        className="input-neon text-lg w-full"
                        value={formData[item.field]}
                        onChange={(e) => updateData(item.field, e.target.value)}
                      >
                        <option value="">{t('survey.fields.select')}</option>
                        {item.opts?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  ) : (
                    <input 
                      type="number" 
                      className="input-neon text-lg w-full"
                      placeholder={item.placeholder}
                      value={formData[item.field]}
                      onChange={(e) => updateData(item.field, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <p className="text-xl font-black italic text-white uppercase tracking-tighter">{t('survey.pushup_capacity')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['0-10', '10-30', '30-50', '50+'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateData('pushUps', val)}
                    className="button-neon text-xl"
                    style={{ 
                      backgroundColor: formData.pushUps === val ? 'white' : 'rgba(255,255,255,0.05)',
                      color: formData.pushUps === val ? 'black' : 'white',
                      boxShadow: formData.pushUps === val ? '6px 6px 0px var(--main-color)' : 'none'
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-xl font-black italic text-white uppercase tracking-tighter">{t('survey.run_endurance')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['<5M', '10M', '20M', '30M+'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateData('runTime', val)}
                    className="button-neon text-xl"
                    style={{ 
                      backgroundColor: formData.runTime === val ? 'white' : 'rgba(255,255,255,0.05)',
                      color: formData.runTime === val ? 'black' : 'white',
                      boxShadow: formData.runTime === val ? '6px 6px 0px var(--main-color)' : 'none'
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <p className="text-xl font-black italic text-white uppercase tracking-tighter text-center">{t('survey.training_tuning')}</p>
            <div className="grid grid-cols-1 gap-6">
              {[
                { id: 'never', label: t('survey.frequency.never'), desc: t('survey.frequency.never_desc') },
                { id: '1-2', label: t('survey.frequency.low'), desc: t('survey.frequency.low_desc') },
                { id: '3-5', label: t('survey.frequency.mid'), desc: t('survey.frequency.mid_desc') },
                { id: 'daily', label: t('survey.frequency.daily'), desc: t('survey.frequency.daily_desc') },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateData('frequency', opt.id)}
                  className={`p-6 transform -skew-x-12 flex flex-col gap-1 transition-all border-l-8 ${formData.frequency === opt.id ? 'bg-white text-black border-main' : 'bg-white/5 text-white/60 border-white/20 hover:bg-white/10'}`}
                >
                  <span className="text-2xl font-black uppercase italic tracking-tighter">{opt.label}</span>
                  <span className="text-xs opacity-60 font-black uppercase tracking-widest">{opt.desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <p className="text-xl font-black italic text-white uppercase tracking-tighter text-center">{t('survey.primary_objective')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'STR', label: t('survey.goals.str'), color: 'bg-main' },
                { id: 'WEIGHT', label: t('survey.goals.weight'), color: 'bg-secondary-color' },
                { id: 'AGI', label: t('survey.goals.agi'), color: 'bg-white' },
                { id: 'DISC', label: t('survey.goals.disc'), color: 'bg-main' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateData('goal', opt.id)}
                  className={`p-10 transform -skew-x-12 flex items-center justify-center text-center transition-all border-4 ${formData.goal === opt.id ? `${opt.color} text-black border-black scale-105 shadow-[20px_20px_0px_white]` : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}`}
                >
                  <span className={`text-2xl font-black uppercase italic tracking-tighter ${formData.goal === opt.id ? 'text-black' : 'text-white'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    const d = formData;
    switch (currentStep) {
      case 0: return d.gender && d.age && d.weight && d.height;
      case 1: return d.pushUps && d.runTime;
      case 2: return d.frequency;
      case 3: return d.goal;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="smash-slash opacity-30" />
      <div className="scanline" />

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl z-10"
      >
        <div className="system-card border-white shadow-[15px_15px_0px_var(--main-color)] p-0 relative">
          <button
            onClick={onLogout}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-red-500 transition-all duration-300 transform -skew-x-12 z-50 group"
            title={t('profile.emergency_logout')}
          >
            <X className="w-6 h-6 text-white group-hover:scale-110" />
          </button>
          <div className="p-12 md:p-20 space-y-16">
            <div className="flex justify-between items-center gap-4">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex-1 flex flex-col gap-3">
                  <div className={`h-4 transform -skew-x-12 transition-all duration-500 ${idx <= currentStep ? 'bg-main shadow-[0_4px_0px_white]' : 'bg-white/10'}`} />
                  <span className={`text-[10px] font-black uppercase italic tracking-tighter text-center ${idx <= currentStep ? 'text-white' : 'text-white/20'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black italic text-white tracking-tighter uppercase leading-none">
                {steps[currentStep].title} 
              </h1>
              <div className="h-4 w-48 bg-main transform -skew-x-12 mt-2" />
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`text-xl font-black italic uppercase tracking-tighter ${currentStep === 0 ? 'opacity-0' : 'text-white/40 hover:text-white transition-colors'}`}
              >
                {t('survey.back')}
              </button>
              
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`button-neon text-3xl px-16 ${!isStepValid() ? 'opacity-20 grayscale pointer-events-none' : ''}`}
              >
                {currentStep === steps.length - 1 ? t('survey.awake') : t('survey.next')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SurveyStepper;




