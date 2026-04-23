import { motion } from 'framer-motion';
import { useEffect, useState, FC } from 'react';
import { useLanguage } from '../../../LanguageContext';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: FC<SplashScreenProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="smash-slash opacity-20" />
      <div className="scanline" />

      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
        <h1 className="text-[50vw] font-black italic tracking-tighter transform -rotate-12">LOCKIN</h1>
      </div>

      <motion.div
        initial={{ scale: 2, opacity: 0, rotate: -15 }}
        animate={{ scale: 1, opacity: 1, rotate: -5 }}
        transition={{ type: 'spring', damping: 12, stiffness: 100 }}
        className="relative mb-24 z-10"
      >
        <h1 className="text-9xl md:text-[12rem] font-black text-white italic tracking-tighter uppercase drop-shadow-[8px_8px_0px_var(--main-color)]">
          LOCK <span className="text-main">IN</span>
        </h1>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '120%' }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="absolute -bottom-4 -left-[10%] h-4 bg-white transform -skew-x-12"
        />
      </motion.div>

      <div className="w-80 md:w-96 space-y-4 z-10">
        <div className="flex justify-between items-end px-2">
          <p className="text-xl font-black italic text-white uppercase tracking-tighter">
            {t('splash.initializing')}
          </p>
          <span className="text-2xl font-black italic text-main">{progress}%</span>
        </div>
        
        <div className="h-6 w-full bg-white/10 border-4 border-white p-1 transform -skew-x-12 overflow-hidden relative">
          <motion.div 
            className="h-full bg-main"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-full w-px bg-black/20 ml-auto" />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-32 bg-main transform translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-30" />
      <div className="absolute bottom-0 left-0 w-64 h-32 bg-main transform -translate-x-1/2 translate-y-1/2 -rotate-12 opacity-30" />
    </div>
  );
};

export default SplashScreen;




