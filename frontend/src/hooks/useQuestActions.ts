import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { SystemPopupState } from '../components/quests/SystemPopupModal';

export function useQuestActions(
  completeQuest: (id: number) => Promise<any>,
  cancelQuest: (id: number) => Promise<any>,
  deleteCustomQuest: (id: number) => Promise<any>,
  startQuest: (id: number) => Promise<any>,
  startSystemQuest: (id: number) => Promise<any>,
  fetchProfile?: (userId: number) => Promise<any>,
  user?: any
) {
  const { t } = useLanguage();
  const [systemPopup, setSystemPopup] = useState<SystemPopupState | null>(null);

  const closePopup = () => setSystemPopup(null);

  const handleCompleteQuest = async (id: number) => {
    try {
      const response: any = await completeQuest(id);
      setSystemPopup({
        isOpen: true,
        title: t('quests.protocol_success'),
        type: 'REWARDS',
        rewards: {
          gold: response?.goldReward || 0,
          xp: response?.xpReward || 0
        }
      });

      if (response?.unlockedAchievements && response.unlockedAchievements.length > 0) {
        window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: response.unlockedAchievements }));
      }

      if (fetchProfile && user?.id) {
        await fetchProfile(user.id);
      }
    } catch (err: any) {
      setSystemPopup({
        isOpen: true,
        title: 'SYNC ERROR',
        message: err.message || 'FAILED TO UPLOAD DATA TO COLISEUM.',
        type: 'DANGER'
      });
    }
  };

  const promptCancelQuest = (pid: number) => {
    setSystemPopup({
      isOpen: true,
      title: t('quests.abort_protocol'),
      message: t('quests.terminate_mission'),
      type: 'DANGER',
      onConfirm: async () => {
        try {
          await cancelQuest(pid);
        } catch (err: any) {
          setSystemPopup({
            isOpen: true,
            title: t('quests.protocol_failed'),
            message: err.message || 'FAILED TO TERMINATE MISSION.',
            type: 'DANGER'
          });
        }
      }
    });
  };

  const promptDeleteQuest = (pid: number) => {
    setSystemPopup({
      isOpen: true,
      title: t('quests.purge_protocol'),
      message: t('quests.delete_warning'),
      type: 'DANGER',
      onConfirm: async () => {
        try {
          await deleteCustomQuest(pid);
        } catch (err: any) {
          setSystemPopup({
            isOpen: true,
            title: 'DELETE FAILED',
            message: err.message || 'THE SERVER REJECTED THE DELETION REQUEST.',
            type: 'DANGER'
          });
        }
      }
    });
  };

  const promptStartQuest = (quest: any, activeQuest: any) => {
    if (!activeQuest) {
      setSystemPopup({
        isOpen: true,
        title: t('quests.initialize'),
        message: t('quests.confirm_initialize'),
        type: 'INFO',
        onConfirm: async () => {
          try {
            if (quest.type === 'SYSTEM') {
              await startSystemQuest(quest.id || quest.questId);
            } else {
              await startQuest(quest.id || quest.questId);
            }
          } catch (err: any) {
            setSystemPopup({
              isOpen: true,
              title: 'INITIALIZATION FAILED',
              message: err.message || 'FAILED TO COMMENCE MISSION.',
              type: 'DANGER'
            });
          }
        }
      });
    } else {
      setSystemPopup({
        isOpen: true,
        title: t('auth.alert'),
        message: t('quests.system_overload'),
        type: 'WARNING'
      });
    }
  };

  return {
    systemPopup,
    setSystemPopup,
    closePopup,
    handleCompleteQuest,
    promptCancelQuest,
    promptDeleteQuest,
    promptStartQuest
  };
}
