import { type FC, type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

const PopupWindow: FC<PopupWindowProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  maxWidth = 'max-w-lg' 
}) => {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-overlay"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative z-20 w-full ${maxWidth} bg-surface border-4 border-neutral-white shadow-[12px_12px_0px_var(--main-color)] overflow-hidden flex flex-col max-h-[90vh]`}
          >
            <div className="bg-main p-4 flex justify-between items-center border-b-4 border-neutral-white transform origin-left">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-black truncate">
                {title || 'SYSTEM NOTIFICATION'}
              </h2>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-black hover:text-white transition-all text-black"
              >
                <X className="w-5 h-5 stroke-[3px]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              {children}
            </div>

            {footer && (
              <div className="p-4 bg-surface border-t-2 border-border">
                {footer}
              </div>
            )}

            <div className="absolute top-0 left-0 w-2 h-2 bg-white" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-main" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PopupWindow;




