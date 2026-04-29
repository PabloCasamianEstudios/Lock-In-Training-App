import { type FC } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  max?: number;
  color?: string;
  height?: string;
  className?: string;
  label?: React.ReactNode;
  valueLabel?: string;
}


const ProgressBar: FC<ProgressBarProps> = ({ 
  progress, 
  max = 100, 
  color = 'bg-main', 
  height = 'h-1.5',
  className = '',
  label,
  valueLabel
}) => {
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || valueLabel) && (
        <div className="flex justify-between text-[10px] font-black uppercase text-text-main opacity-70">
          <span className="flex items-center gap-1">{label}</span>
          <span>{valueLabel}</span>
        </div>
      )}
      <div className={`${height} w-full bg-surface border border-border relative overflow-hidden`}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${color} shadow-[0_0_10px_currentColor]`}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;




