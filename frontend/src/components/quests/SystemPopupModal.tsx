import { AlertTriangle, Info, Trophy, Zap, Coins } from 'lucide-react';
import PopupWindow from '../common/PopupWindow';
import { useLanguage } from '../../LanguageContext';

export interface SystemPopupState {
  isOpen: boolean;
  title: string;
  message?: string;
  type: 'INFO' | 'WARNING' | 'DANGER' | 'REWARDS';
  onConfirm?: () => void;
  rewards?: { gold: number; xp: number };
}

interface SystemPopupModalProps {
  popup: SystemPopupState | null;
  onClose: () => void;
}

export default function SystemPopupModal({ popup, onClose }: SystemPopupModalProps) {
  const { t } = useLanguage();

  return (
    <PopupWindow
      isOpen={!!popup?.isOpen}
      onClose={onClose}
      title={popup?.title}
      maxWidth={popup?.type === 'REWARDS' ? 'max-w-xs' : 'max-w-sm'}
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {popup?.type === 'REWARDS' ? (
          <>
            <div className="w-24 h-24 bg-main flex items-center justify-center rounded-sm transform rotate-12 shadow-[10px_10px_0px_var(--neutral-white)] border-4 border-neutral-black">
              <Trophy className="w-14 h-14 text-neutral-black -rotate-12" />
            </div>

            <div className="space-y-4 w-full">
              <div className="bg-surface border-2 border-border p-5 transform -skew-x-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Zap className="w-8 h-8 text-main" fill="currentColor" />
                  <span className="font-black italic uppercase text-[10px] tracking-[0.2em] text-text-main">{t('quests.rewards.xp')}</span>
                </div>
                <span className="text-3xl font-black text-main">+{popup.rewards?.xp}</span>
              </div>

              <div className="bg-surface border-2 border-border p-5 transform -skew-x-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Coins className="w-8 h-8 text-yellow-500" fill="currentColor" />
                  <span className="font-black italic uppercase text-[10px] tracking-[0.2em] text-text-main">{t('quests.rewards.gold')}</span>
                </div>
                <span className="text-3xl font-black text-yellow-500">+{popup.rewards?.gold}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-5 bg-neutral-white text-neutral-black font-black uppercase italic tracking-[0.2em] hover:bg-main hover:text-neutral-black transition-all shadow-[6px_6px_0px_var(--main-color)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {t('quests.rewards.collect')}
            </button>
          </>
        ) : (
          <>
            <div className={`p-5 rounded-sm transform rotate-45 border-4 ${popup?.type === 'DANGER' ? 'border-red-500 bg-red-600' : 'border-main bg-main'}`}>
              <div className="-rotate-45">
                {popup?.type === 'DANGER' ? <AlertTriangle className="w-12 h-12 text-neutral-black" /> : <Info className="w-12 h-12 text-neutral-black" />}
              </div>
            </div>
            <p className="text-[11px] font-black uppercase italic tracking-widest text-text-main leading-relaxed font-mono">
              {popup?.message}
            </p>
            <div className="flex gap-4 w-full pt-4">
              {popup?.onConfirm ? (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 border-2 border-border text-[10px] font-black uppercase italic hover:bg-surface transition-all font-mono text-text-secondary"
                  >
                    {t('quest_view.abort')}
                  </button>
                  <button
                    onClick={() => {
                      popup.onConfirm?.();
                      onClose();
                    }}
                    className="flex-1 py-4 bg-red-600 text-neutral-black text-[10px] font-black uppercase italic hover:bg-red-500 transition-all shadow-[4px_4px_0px_var(--neutral-white)]"
                  >
                    {t('level_up.confirm')}
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-main text-neutral-black text-[10px] font-black uppercase italic shadow-[4px_4px_0px_var(--neutral-white)]"
                >
                  OK
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </PopupWindow>
  );
}
