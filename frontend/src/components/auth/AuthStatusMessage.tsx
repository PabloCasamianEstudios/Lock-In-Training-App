import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/LanguageContext';

interface AuthStatusMessageProps {
  error: string | null;
  successMessage: string | null;
}

export const AuthStatusMessage: FC<AuthStatusMessageProps> = ({ error, successMessage }) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence mode="wait">
      {error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          className="bg-red-600 border-l-4 border-red-500 p-4 mb-4 transform -skew-x-12 flex items-start gap-4"
        >
          <div className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-sm">{t('auth.alert')}</div>
          <p className="text-red-500 font-bold italic text-xs uppercase tracking-tighter leading-tight">
            {error}
          </p>
        </motion.div>
      ) : successMessage ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          className="bg-green-500/10 border-l-4 border-green-500 p-4 mb-4 transform -skew-x-12 flex items-start gap-4"
        >
          <div className="bg-green-500 text-black font-black text-[10px] px-2 py-0.5 rounded-sm">{t('auth.success')}</div>
          <p className="text-green-500 font-bold italic text-xs uppercase tracking-tighter leading-tight">
            {successMessage}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
