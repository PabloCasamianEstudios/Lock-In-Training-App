import { FC } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Globe } from 'lucide-react';
import { useLanguage } from '@/LanguageContext';

interface AuthActionsProps {
  isLogin: boolean;
  loading: boolean;
  onToggleMode: () => void;
  onGuestEntry: () => void;
}

export const AuthActions: FC<AuthActionsProps> = ({
  isLogin,
  loading,
  onToggleMode,
  onGuestEntry
}) => {
  const { t } = useLanguage();

  return (
    <div className="pt-4 flex flex-col gap-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="button-neon w-full flex items-center justify-center gap-4 text-2xl"
        disabled={loading}
      >
        {loading ? (
          <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin" />
        ) : (
          <>
            {isLogin ? <LogIn className="w-6 h-6 mb-1" /> : <UserPlus className="w-6 h-6 mb-1" />}
            <span>{isLogin ? t('auth.enter_stage') : t('auth.finalize_profile')}</span>
          </>
        )}
      </motion.button>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center px-2">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-[10px] text-[var(--secondary-text)] uppercase hover:text-main transition-colors font-black tracking-[0.2em] italic"
        >
          {isLogin ? t('auth.no_data') : t('auth.already_registered')}
        </button>

        <button
          type="button"
          onClick={onGuestEntry}
          className="text-[10px] text-main uppercase hover:text-text-main transition-colors flex items-center gap-2 font-black tracking-widest italic"
        >
          <Globe className="w-3 h-3" />
          {t('auth.guest_override')}
        </button>
      </div>
    </div>
  );
};
