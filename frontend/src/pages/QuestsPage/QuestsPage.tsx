import { useState, type FC, useMemo } from 'react';
import { useQuests } from '../../hooks/useQuests';
import { useQuestActions } from '../../hooks/useQuestActions';
import { Plus, ScrollText } from 'lucide-react';
import type { PageProps } from '../../types';
import CreateQuestModal from '../../components/quests/CreateQuestModal';
import ActiveQuestView from '../../components/quests/ActiveQuestView';
import PageLayout from '../../components/common/PageLayout';
import { useLanguage } from '../../LanguageContext';

import QuestsTabsNav, { QuestTabType } from '../../components/quests/QuestsTabsNav';
import QuestList from '../../components/quests/QuestList';
import EmptyActiveQuest from '../../components/quests/EmptyActiveQuest';
import SystemPopupModal from '../../components/quests/SystemPopupModal';

interface QuestsPageProps extends PageProps {
  onNavigate?: (tab: string, params?: any) => void;
  fetchProfile?: (userId: number) => Promise<any>;
}

const QuestsPage: FC<QuestsPageProps> = ({ user, profile, onNavigate, fetchProfile }) => {
  const { t } = useLanguage();
  const { 
    quests, 
    activeQuest, 
    systemQuests, 
    loading, 
    error, 
    startQuest, 
    startSystemQuest, 
    cancelQuest, 
    completeQuest, 
    createCustomQuest, 
    updateCustomQuest, 
    deleteCustomQuest, 
    getCustomQuests 
  } = useQuests(user?.id ?? null);
  
  const [activeSubTab, setActiveSubTab] = useState<QuestTabType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<any | null>(null);

  const {
    systemPopup,
    closePopup,
    handleCompleteQuest,
    promptCancelQuest,
    promptDeleteQuest,
    promptStartQuest
  } = useQuestActions(
    completeQuest,
    cancelQuest,
    deleteCustomQuest,
    startQuest,
    startSystemQuest,
    fetchProfile,
    user
  );

  const customQuests = useMemo(() => getCustomQuests(), [getCustomQuests]);
  const dailyQuests = useMemo(() => quests.filter(q => !q.completed), [quests]);
  
  const filteredQuests = useMemo(() => {
    switch (activeSubTab) {
      case 'DAILY': return dailyQuests;
      case 'SYSTEM': return systemQuests;
      case 'YOURS': return customQuests;
      case 'ALL': return [...dailyQuests, ...systemQuests, ...customQuests];
      default: return [];
    }
  }, [activeSubTab, dailyQuests, customQuests, systemQuests]);

  if (loading) {
    return (
      <PageLayout title={t('quests.title')} subtitle={t('quests.subtitle_decrypting')} icon={ScrollText}>
        <div className="p-10 text-main animate-pulse font-black uppercase text-xs italic tracking-widest text-center mt-20">{t('quests.initializing')}</div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={t('quests.title')} subtitle={t('quests.error')} icon={ScrollText}>
        <div className="p-10 text-neutral-black uppercase font-black text-center mt-20 border-4 border-red-500 bg-red-600">Error: {error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('quests.title')}
      subtitle={t('quests.subtitle_assignments')}
      icon={ScrollText}
    >
      <div className="md:grid md:grid-cols-12 md:gap-12 items-start">
        <QuestsTabsNav 
          activeSubTab={activeSubTab} 
          setActiveSubTab={setActiveSubTab} 
          counts={{
            system: systemQuests.length,
            daily: dailyQuests.length,
            active: activeQuest ? 1 : 0,
            yours: customQuests.length
          }}
        />

        <div className="md:col-span-9 lg:col-span-10">
          {activeSubTab === 'ACTIVE' ? (
            activeQuest ? (
              <ActiveQuestView
                activeProgress={activeQuest}
                onUpdateProgress={() => { }}
                onComplete={(pid) => handleCompleteQuest(pid)}
                onCancel={(pid) => promptCancelQuest(pid)}
              />
            ) : (
              <EmptyActiveQuest />
            )
          ) : (
            <QuestList 
              quests={filteredQuests}
              userId={user?.id}
              onEditQuest={(quest) => {
                setEditingQuest(quest);
                setIsModalOpen(true);
              }}
              onDeleteQuest={promptDeleteQuest}
              onStartQuest={(quest) => promptStartQuest(quest, activeQuest)}
            />
          )}
        </div>
      </div>

      <button
        onClick={() => {
          setEditingQuest(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-24 right-8 w-20 h-20 bg-main border-4 border-white shadow-[8px_8px_0px_white] flex items-center justify-center text-black hover:bg-white transition-all z-50 hover:scale-110 active:scale-95 active:shadow-none active:translate-x-1 active:translate-y-1"
      >
        <Plus className="w-10 h-10 font-black" />
      </button>

      <CreateQuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(data) => createCustomQuest(data)}
        initialData={editingQuest}
        onUpdate={(id, data) => updateCustomQuest(id, data)}
      />

      <SystemPopupModal popup={systemPopup} onClose={closePopup} />
    </PageLayout>
  );
};

export default QuestsPage;
