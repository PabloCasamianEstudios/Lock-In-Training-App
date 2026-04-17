import { type FC, type ReactNode } from 'react';

interface BrutalistCardProps {
  children: ReactNode;
  variant?: 'white' | 'accent' | 'heavy';
  className?: string;
  padding?: string;
  onClick?: () => void;
}

/**
 * Standard Brutalist Card with thick borders and project-specific shadows.
 */
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
        return 'border-white shadow-[6px_6px_0px_var(--main-color)]';
      case 'heavy': 
        return 'border-4 border-white shadow-[10px_10px_0px_var(--main-color)]';
      case 'white': 
      default: 
        return 'border-white shadow-[6px_6px_0px_white]';
    }
  };

  const baseClasses = `bg-black border-2 relative transition-all ${getVariantClasses()} ${padding} ${className}`;
  
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
