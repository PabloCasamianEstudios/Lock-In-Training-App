import { type FC, useState, useEffect } from 'react';
import { User as UserIcon, ShieldCheck, Mail, Database, Award, Settings, LogOut, Loader2, UserCircle, Globe, Edit2, Trophy, Download } from 'lucide-react';
import { userService } from '../../services/userService';
import { socialService } from '../../services/socialService';
import type { User } from '../../types';
import PageLayout from '../../components/common/PageLayout';
import type { PageProps } from '../../types';
import { useLanguage } from '../../LanguageContext';
import PopupWindow from '../../components/common/PopupWindow';
import { StatsChart } from '../../components/profile/StatsChart';
import { AchievementsGrid, type Achievement } from '../../components/profile/AchievementsGrid';
import { motion, AnimatePresence } from 'framer-motion';


const ProfilePage: FC<PageProps> = ({ user, profile, onLogout, targetId }) => {
  const { t, language, setLanguage } = useLanguage();
  const isOwnProfile = !targetId || targetId === user?.id;
  const [targetProfile, setTargetProfile] = useState<User | null>(null);
  const [friendStatus, setFriendStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('NONE');
  const [loading, setLoading] = useState(!isOwnProfile);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'STATS' | 'ACHIEVEMENTS'>('STATS');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [titles, setTitles] = useState<any[]>([]);
  const [isTitlePickerOpen, setIsTitlePickerOpen] = useState(false);

  useEffect(() => {
    if (!isOwnProfile && targetId && user?.id) {
      setLoading(true);
      Promise.all([
        userService.getUserProfile(targetId, false),
        socialService.getFriendshipStatus(user.id, targetId),
        userService.getUserAchievements(targetId),
        userService.getUserTitles(targetId)
      ])
        .then(([profileData, statusData, achData, titleData]) => {
          setTargetProfile(profileData);
          setFriendStatus(statusData.status);
          setAchievements(achData);
          setTitles(titleData);
        })
        .catch(err => console.error('[ProfilePage] Failed to fetch target data:', err))
        .finally(() => setLoading(false));
    } else if (isOwnProfile && user?.id) {
      setLoading(true);
      Promise.all([
        userService.getUserAchievements(user.id),
        userService.getUserTitles(user.id)
      ])
        .then(([achData, titleData]) => {
          setAchievements(achData);
          setTitles(titleData);
        })
        .catch(err => console.error('[ProfilePage] Failed to fetch achievements/titles:', err))
        .finally(() => setLoading(false));
    }
  }, [isOwnProfile, targetId, user?.id]);

  const handleAddFriend = async () => {
    if (!user || !targetId) return;
    setActionLoading(true);
    try {
      await socialService.sendFriendRequest(user.id, targetId);
      setFriendStatus('PENDING');
    } catch (err) {
      console.error('Error sending friend request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const displayUser = isOwnProfile ? user : targetProfile;
  const displayProfile = isOwnProfile ? profile : targetProfile;
  const equippedTitle = titles.find(t => t.isEquipped)?.name || 'Sin título';

  const handleEquipTitle = async (titleId: number) => {
    if (!user?.id) return;
    setActionLoading(true);
    try {
      await userService.equipTitle(user.id, titleId);
      const updatedTitles = await userService.getUserTitles(user.id);
      setTitles(updatedTitles);
      setIsTitlePickerOpen(false);
    } catch (err) {
      console.error('Error equipping title:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportData = () => {
    if (!displayProfile) return;
    
    const dataStr = JSON.stringify(displayProfile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lockin_data_${displayUser?.username || 'user'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <PageLayout 
        title={t('profile.title')} 
        subtitle={t('profile.subtitle_syncing')}
        icon={UserCircle}
      >
        <div className="flex flex-col items-center justify-center h-[40vh] text-center gap-4">
          <Loader2 className="w-8 h-8 text-main animate-spin" />
          <p className="text-main font-black italic uppercase tracking-widest text-xs">{t('profile.acquiring_data')}</p>
        </div>
      </PageLayout>
    );
  }

  const pageTitle = `${displayUser?.username || t('common.hunter')}'s profile`;

  return (
    <PageLayout 
      title={pageTitle} 
      subtitle={isOwnProfile ? t('profile.terminal') : t('profile.dossier')}
      icon={UserCircle}
    >
      <div className="space-y-12 max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-8 border-b-4 border-white/10 pb-12 relative">
          <div className="relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-main rounded-sm transform -rotate-3 overflow-hidden border-4 border-white shadow-[12px_12px_0px_var(--secondary-color)] group-hover:scale-105 transition-all duration-500 hover:rotate-0">
              {displayProfile?.profilePic ? (
                <img src={displayProfile.profilePic} alt={displayUser?.username} className="w-full h-full object-cover transform rotate-3 scale-110 group-hover:rotate-0 group-hover:scale-100 transition-all duration-500" />
              ) : (
                <UserIcon className="w-full h-full text-black p-8 transform rotate-3 group-hover:rotate-0 transition-all duration-500" />
              )}
            </div>
            <div className="absolute -bottom-3 -right-3 bg-black border-4 border-white px-5 py-2 font-black text-sm md:text-lg text-main transform -skew-x-12 z-10 shadow-xl">
              {t('profile.level')} {displayProfile?.level || 1}
            </div>
          </div>
          
          <div className="space-y-4 text-center">
            <h2 className="text-4xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">
              {displayUser?.username || 'HUNTER_X'}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-main font-black italic uppercase tracking-widest text-sm md:text-xl">
                "{equippedTitle}"
              </span>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsTitlePickerOpen(true)}
                  className="p-1 hover:bg-white/10 text-white/40 hover:text-main transition-all rounded-sm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-6 justify-center items-center">
              <span className="text-[10px] md:text-xs bg-white text-black px-4 py-1 font-black uppercase tracking-widest italic transform -skew-x-12">
                {displayUser?.email || 'OFFLINE_PROTOCOL'}
              </span>
              <span className="text-[10px] md:text-xs bg-main text-black px-4 py-1 font-black uppercase tracking-widest italic transform -skew-x-12 shadow-[4px_4px_0px_white]">
                {t('common.rank')} {displayProfile?.rank || 'E'}
              </span>
            </div>

            {!isOwnProfile && displayUser && (
              <div className="mt-8">
                {friendStatus === 'NONE' || friendStatus === 'REJECTED' ? (
                  <button 
                    onClick={handleAddFriend}
                    disabled={actionLoading}
                    className="bg-main text-black border-4 border-main px-10 py-4 font-black italic uppercase tracking-widest text-sm hover:bg-white hover:border-white transition-all disabled:opacity-50 shadow-[8px_8px_0px_white] active:shadow-none active:translate-x-1 active:translate-y-1"
                  >
                    {actionLoading ? t('profile.processing') : t('profile.add_friend')}
                  </button>
                ) : friendStatus === 'PENDING' ? (
                  <button disabled className="bg-white/10 text-white/40 border-4 border-white/20 px-10 py-4 font-black italic uppercase tracking-widest text-sm transform -skew-x-12">
                    {t('profile.request_sent')}
                  </button>
                ) : (
                  <button disabled className="bg-main/20 text-main border-4 border-main px-10 py-4 font-black italic uppercase tracking-widest text-sm transform -skew-x-12">
                    {t('profile.already_friends')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab('STATS')}
              className={`px-6 py-2 text-[10px] font-black border-2 transition-all uppercase tracking-[0.2em] whitespace-nowrap
                ${activeTab === 'STATS'
                  ? 'bg-main text-black border-main shadow-[4px_4px_0px_white]'
                  : 'bg-black text-white/40 border-white/20 hover:border-white/40'}`}
            >
              STATS
            </button>
            <button
              onClick={() => setActiveTab('ACHIEVEMENTS')}
              className={`px-6 py-2 text-[10px] font-black border-2 transition-all uppercase tracking-[0.2em] whitespace-nowrap
                ${activeTab === 'ACHIEVEMENTS'
                  ? 'bg-main text-black border-main shadow-[4px_4px_0px_white]'
                  : 'bg-black text-white/40 border-white/20 hover:border-white/40'}`}
            >
              {t('profile.achievements')}
            </button>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-6 py-2 text-[10px] font-black border-2 transition-all uppercase tracking-[0.2em] whitespace-nowrap bg-black text-white/40 border-white/20 hover:border-white/40"
                >
                  {t('profile.system_settings')}
                </button>
                <button
                  onClick={onLogout}
                  className="px-6 py-2 text-[10px] font-black border-2 transition-all uppercase tracking-[0.2em] whitespace-nowrap bg-black text-red-500/80 border-red-500/50 hover:bg-red-500/10 hover:border-red-500"
                >
                  {t('profile.emergency_logout')}
                </button>
              </>
            )}
          </nav>

          <AnimatePresence mode="wait">
            {activeTab === 'STATS' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StatsChart stats={((displayProfile as any)?.stats as Record<string, number>) || {}} />
              </motion.div>
            )}
            {activeTab === 'ACHIEVEMENTS' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AchievementsGrid achievements={achievements} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PopupWindow
        isOpen={isTitlePickerOpen}
        onClose={() => setIsTitlePickerOpen(false)}
        title="ELIGE TU TÍTULO"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
          {titles.length === 0 ? (
            <div className="text-center py-8 opacity-40">
              <p className="font-black italic uppercase tracking-widest text-xs">No tienes títulos desbloqueados</p>
            </div>
          ) : (
            titles.map((t) => (
              <button
                key={t.id}
                onClick={() => handleEquipTitle(t.titleId)}
                disabled={actionLoading || t.isEquipped}
                className={`w-full p-6 border-4 text-left transition-all group flex items-center gap-4
                  ${t.isEquipped 
                    ? 'bg-main border-main text-black cursor-default' 
                    : 'bg-black border-white/10 text-white hover:border-main active:translate-x-1 active:translate-y-1'
                  }
                  ${actionLoading ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                <div className={`p-3 border-2 ${t.isEquipped ? 'border-black' : 'border-white/20 group-hover:border-main'}`}>
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-black italic uppercase tracking-tighter text-lg leading-none">{t.name}</p>
                  <p className={`text-[10px] font-bold uppercase mt-1 ${t.isEquipped ? 'text-black/60' : 'text-white/40'}`}>
                    {t.description}
                  </p>
                </div>
                {t.isEquipped && (
                  <span className="text-[10px] font-black italic uppercase bg-black text-main px-2 py-1">EQUIPADO</span>
                )}
              </button>
            ))
          )}
        </div>
      </PopupWindow>

      <PopupWindow
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={t('settings.title')}
        maxWidth="max-w-md"
      >
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-main mb-2">
              <Globe className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase italic tracking-widest">{t('settings.language')}</h3>
            </div>
            
            <div className="relative group">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-zinc-900 border-4 border-white/10 p-5 text-white font-black italic uppercase appearance-none focus:border-main outline-none transition-all cursor-pointer group-hover:border-white/20"
              >
                <option value="es">{t('settings.spanish')}</option>
                <option value="eng">{t('settings.english')}</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-main group-hover:scale-110 transition-transform">
                ▼
              </div>
            </div>
            <p className="text-[10px] text-white/20 font-black uppercase italic tracking-[0.2em]">
              {t('settings.select_language')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-main mb-2">
              <Download className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase italic tracking-widest">BACKUP DATA</h3>
            </div>
            <button 
              onClick={handleExportData}
              className="w-full bg-zinc-900 border-4 border-white/10 p-5 text-white font-black italic uppercase hover:bg-white/5 hover:border-main transition-all flex items-center justify-center gap-3 group"
            >
              EXPORT TO JSON
              <Download className="w-4 h-4 text-main group-hover:scale-120 transition-transform" />
            </button>
            <p className="text-[9px] text-white/20 font-black uppercase italic tracking-[0.1em] text-center">
              DESCARGA TU EXPEDIENTE DE CAZADOR COMPLETO
            </p>
          </div>

          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="w-full bg-main text-black font-black uppercase italic py-4 border-4 border-main shadow-[8px_8px_0px_white] hover:bg-white hover:border-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            {t('settings.save')}
          </button>
        </div>
      </PopupWindow>
    </PageLayout>
  );
};

export default ProfilePage;
