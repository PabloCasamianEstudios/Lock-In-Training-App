import { type FC } from 'react';
import { Lock } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

/* --- RESTRICTED VIEW --- */
interface RestrictedAccessProps {
  onLogout: () => void;
}

const RestrictedAccess: FC<RestrictedAccessProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  return (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
    <div className="relative">
      <div className="absolute inset-0 bg-main blur-3xl opacity-20 animate-pulse" />
      <div className="border-4 border-white p-8 relative bg-black shadow-[10px_10px_0px_var(--main-color)] transform -skew-x-6">
        <Lock className="w-16 h-16 text-main mb-4 mx-auto" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          {t('restricted.access_denied').split(' ')[0]} <span className="text-main">{t('restricted.access_denied').split(' ')[1]}</span>
        </h2>
      </div>
    </div>
    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40 italic">
      {t('restricted.login_prompt')}
    </p>
    <button
      onClick={onLogout}
      className="text-[10px] font-black uppercase tracking-widest text-main hover:text-white transition-colors border-b-2 border-main pb-1 italic"
    >
      {t('restricted.login_button')}
    </button>
  </div>
  );
};

export default RestrictedAccess;
