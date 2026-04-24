import { type FC, useState, useEffect } from 'react';
import { User as UserIcon, ShieldCheck, Mail, Database, Award, Settings, LogOut, Loader2, UserCircle, Globe } from 'lucide-react';
import { userService } from '../../services/userService';
import { socialService } from '../../services/socialService';
import type { User } from '../../types';
import PageLayout from '../../components/common/PageLayout';
import type { PageProps } from '../../types';
import { useLanguage } from '../../LanguageContext';
import PopupWindow from '../../components/common/PopupWindow';

const ProfilePage: FC<PageProps> = ({ user, profile, onLogout, targetId }) => {
  const { t, language, setLanguage } = useLanguage();
  const isOwnProfile = !targetId || targetId === user?.id;
  const [targetProfile, setTargetProfile] = useState<User | null>(null);
  const [friendStatus, setFriendStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('NONE');
  const [loading, setLoading] = useState(!isOwnProfile);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isOwnProfile && targetId && user?.id) {
      setLoading(true);
      Promise.all([
        userService.getUserProfile(targetId, false),
        socialService.getFriendshipStatus(user.id, targetId)
      ])
        .then(([profileData, statusData]) => {
          setTargetProfile(profileData);
          setFriendStatus(statusData.status);
        })
        .catch(err => console.error('[ProfilePage] Failed to fetch target data:', err))
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
        {/* --- PROFILE HEADER (TOP) --- */}
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

        {/* --- STATS & CONTROLS (BOTTOM) --- */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, label: t('profile.achievements'), value: `0 ${t('profile.unlocked')}` },
              { icon: ShieldCheck, label: t('profile.total_logs'), value: `0 ${t('profile.sessions')}` },
              { icon: Database, label: t('profile.account_status'), value: displayUser?.isGuest ? t('profile.guest_override') : t('profile.verified_protocol') },
              { icon: Mail, label: t('profile.notifications'), value: `0 ${t('profile.new_debts')}` }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border-4 border-white/5 p-8 space-y-4 hover:border-main/40 transition-all cursor-default group hover:-translate-y-2 shadow-lg">
                <div className="flex items-center gap-4">
                  <stat.icon className="w-6 h-6 text-main group-hover:scale-125 transition-transform" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">{stat.label}</h3>
                </div>
                <p className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">{stat.value}</p>
              </div>
            ))}
          </div>

          {isOwnProfile && (
            <div className="bg-black border-4 border-white p-10 relative overflow-hidden shadow-[16px_16px_0px_white] transform -rotate-1">
              <h2 className="text-4xl font-black italic uppercase text-white mb-12 border-l-8 border-main pl-8 tracking-tighter">{t('profile.control_panel')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-8 p-8 group hover:bg-main/5 transition-all transform -skew-x-3 border-4 border-white/5 hover:border-main/40 text-left bg-zinc-900/50"
                >
                  <div className="p-5 bg-white/5 group-hover:bg-main/20 transition-colors border-2 border-white/10 group-hover:border-main/30">
                    <Settings className="w-10 h-10 text-white/20 group-hover:text-main transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black uppercase italic text-white leading-none">{t('profile.system_settings')}</h4>
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mt-2">{t('profile.modify_interface')}</p>
                  </div>
                </button>

                <button 
                  onClick={onLogout}
                  className="flex items-center gap-8 p-8 group hover:bg-red-500/5 transition-all transform -skew-x-3 border-4 border-white/5 hover:border-red-500/50 text-left bg-zinc-900/50"
                >
                  <div className="p-5 bg-white/5 group-hover:bg-red-500/20 transition-colors border-2 border-white/10 group-hover:border-red-500/30">
                    <LogOut className="w-10 h-10 text-white/20 group-hover:text-red-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black uppercase italic text-red-500/80 group-hover:text-red-500 leading-none">{t('profile.emergency_logout')}</h4>
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mt-2">{t('profile.terminate_session')}</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- POPUP --- */}
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
