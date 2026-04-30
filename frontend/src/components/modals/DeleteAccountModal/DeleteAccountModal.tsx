import { useState, type FC } from 'react';
import { AlertTriangle, Activity } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import PopupWindow from '../../common/PopupWindow';
import { useLanguage } from '../../../LanguageContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess: () => void;
}

const DeleteAccountModal: FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient(`/api/user/${userId}`, {
        method: 'DELETE'
      });
      onSuccess();
    } catch (err: any) {
      setError(err.error || err.message || 'Error deleting account');
      setLoading(false);
    }
  };

  return (
    <PopupWindow
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.advert')}
      maxWidth="max-w-md"
    >
      <div className="space-y-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto animate-pulse" />

        <div className="space-y-2 text-text-main">
          <p className="font-black italic uppercase text-xl">{t('settings.delete_account_warning')}</p>
          <p className="text-text-secondary opacity-60 text-sm italic font-black uppercase tracking-widest">
            {t('settings.delete_account_warning_2')}
          </p>
        </div>

        {error && (
          <div className="bg-red-600 border-2 border-red-500 text-neutral-black p-3 font-black text-xs uppercase tracking-widest italic">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black italic uppercase py-4 border-2 border-transparent hover:border-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? <Activity className="w-5 h-5 animate-spin" /> : 'SÍ, ELIMINAR CUENTA'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-surface hover:bg-neutral-black text-text-main font-black italic uppercase py-4 border-2 border-border hover:border-text-secondary transition-all"
          >
            {t('quests.rewards.collect').split(' ')[2] || 'CANCELAR'}
          </button>
        </div>
      </div>
    </PopupWindow>
  );
};

export default DeleteAccountModal;
