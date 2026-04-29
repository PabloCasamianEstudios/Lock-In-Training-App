import { type FC, type ReactNode } from 'react';

interface BrutalistCardProps {
  children: ReactNode;
  variant?: 'white' | 'accent' | 'heavy';
  className?: string;
  padding?: string;
  onClick?: () => void;
}

const BrutalistCard: FC<BrutalistCardProps> = ({ 
  children, 
  variant = 'white', 
  className = '', 
  padding = 'p-4',
  onClick
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'accent': 
        return 'border-neutral-white shadow-[6px_6px_0px_var(--main-color)]';
      case 'heavy': 
        return 'border-4 border-neutral-white shadow-[10px_10px_0px_var(--main-color)]';
      case 'white': 
      default: 
        return 'border-neutral-white shadow-[6px_6px_0px_var(--main-color)]';
    }
  };

  const baseClasses = `bg-surface border-2 text-text-main relative transition-all ${getVariantClasses()} ${padding} ${className}`;
  
  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClasses} text-left w-full hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px]`}>
        {children}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

export default BrutalistCard;




