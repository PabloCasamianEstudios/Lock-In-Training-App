import { FC } from 'react';
import { useLanguage } from '@/LanguageContext';

interface AuthHeaderProps {
  isLogin: boolean;
}

export const AuthHeader: FC<AuthHeaderProps> = ({ isLogin }) => {
  const { t } = useLanguage();
  
  return (
    <div className="mb-12 space-y-1">
      <h2 className="text-5xl font-black italic text-[var(--neutral-white)] tracking-tighter uppercase leading-none">
        {isLogin ? t('auth.system') : t('auth.new')}
        <span className="block text-main"> {isLogin ? t('auth.access') : t('auth.player')}</span>
      </h2>
      <div className="h-2 w-24 bg-main transform -skew-x-12" />
    </div>
  );
};
