import { type FC, useState, useEffect } from 'react';
import { User as UserIcon, ShieldCheck, Mail, Database, Award, Settings, LogOut, Loader2 } from 'lucide-react';
import { userService } from '../../services/userService';
import { socialService } from '../../services/socialService';
import type { User } from '../../types';
import AppHeader from '../../components/common/AppHeader';
import type { PageProps } from '../../types';

const ProfilePage: FC<PageProps> = ({ user, profile, onLogout, targetId }) => {
  const isOwnProfile = !targetId || targetId === user?.id;
  const [targetProfile, setTargetProfile] = useState<User | null>(null);
  const [friendStatus, setFriendStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('NONE');
  const [loading, setLoading] = useState(!isOwnProfile);
  const [actionLoading, setActionLoading] = useState(false);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <Loader2 className="w-8 h-8 text-main animate-spin" />
        <p className="text-main font-black italic uppercase tracking-widest text-xs">Acquiring Hunter Data...</p>
      </div>
    );
  }

  const displayUser = isOwnProfile ? user : targetProfile;
  const displayProfile = isOwnProfile ? profile : targetProfile;

  return (
    <div className="max-w-md mx-auto space-y-8 pb-20 p-4">
      <AppHeader title={isOwnProfile ? "PROFILE" : `${displayUser?.username}'S PROFILE`} />

      <div className="flex flex-col items-center gap-6 border-b-2 border-white/10 pb-8 relative">
        <div className="relative group">
          <div className="w-32 h-32 bg-main rounded-sm transform -rotate-3 overflow-hidden border-4 border-white shadow-[10px_10px_0px_var(--secondary-color)] group-hover:scale-110 transition-transform duration-500">
            {displayProfile?.profilePic ? (
              <img src={displayProfile.profilePic} alt={displayUser?.username} className="w-full h-full object-cover transform rotate-3 scale-110" />
            ) : (
              <UserIcon className="w-full h-full text-black p-4 transform rotate-3" />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-black border-2 border-white px-3 py-1 font-black text-xs text-main transform -skew-x-12 z-10">
            Lvl {displayProfile?.level || 1}
          </div>
        </div>
        
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{displayUser?.username || 'HUNTER_X'}</h2>
          <div className="flex gap-4 justify-center">
            <span className="text-[10px] bg-white text-black px-2 py-0.5 font-black uppercase tracking-widest italic">{displayUser?.email || 'OFFLINE_PROTOCOL'}</span>
            <span className="text-[10px] bg-main text-black px-2 py-0.5 font-black uppercase tracking-widest italic">Rank {displayProfile?.rank || 'E'}</span>
          </div>

          {!isOwnProfile && displayUser && (
            <div className="mt-4">
              {friendStatus === 'NONE' || friendStatus === 'REJECTED' ? (
                <button 
                  onClick={handleAddFriend}
                  disabled={actionLoading}
                  className="bg-main text-black border-2 border-main px-6 py-2 font-black italic uppercase tracking-widest text-sm hover:bg-white hover:border-white transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'PROCESS...' : 'ADD FRIEND'}
                </button>
              ) : friendStatus === 'PENDING' ? (
                <button disabled className="bg-white/10 text-white/40 border-2 border-white/20 px-6 py-2 font-black italic uppercase tracking-widest text-sm">
                  REQUEST SENT
                </button>
              ) : (
                <button disabled className="bg-main/20 text-main border-2 border-main px-6 py-2 font-black italic uppercase tracking-widest text-sm">
                  ALREADY FRIENDS
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/5 p-6 space-y-4 hover:border-main/40 transition-colors cursor-default transform transition-all hover:-translate-y-2">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-main" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 italic">ACHIEVEMENTS</h3>
          </div>
          <p className="text-xl font-black italic text-white uppercase tracking-tighter">0 UNLOCKED</p>
        </div>

        <div className="bg-white/5 border border-white/5 p-6 space-y-4 hover:border-main/40 transition-colors cursor-default transform transition-all hover:-translate-y-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-main" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 italic">TOTAL LOGS</h3>
          </div>
          <p className="text-xl font-black italic text-white uppercase tracking-tighter">0 SESSIONS</p>
        </div>

        <div className="bg-white/5 border border-white/5 p-6 space-y-4 hover:border-main/40 transition-colors cursor-default transform transition-all hover:-translate-y-2">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-main" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 italic">ACCOUNT STATUS</h3>
          </div>
          <p className="text-xl font-black italic text-white uppercase tracking-tighter">{displayUser?.isGuest ? 'GUEST OVERRIDE' : 'VERIFIED PROTOCOL'}</p>
        </div>

        <div className="bg-white/5 border border-white/5 p-6 space-y-4 hover:border-main/40 transition-colors cursor-default transform transition-all hover:-translate-y-2">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-main" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 italic">NOTIFICATIONS</h3>
          </div>
          <p className="text-xl font-black italic text-white uppercase tracking-tighter">0 NEW DEBTS</p>
        </div>
      </div>

      {isOwnProfile && (
        <div className="bg-black border-4 border-white p-6 relative overflow-hidden shadow-[10px_10px_0px_white]">
          <h2 className="text-2xl font-black italic uppercase text-white mb-8 border-l-8 border-main pl-6 tracking-tighter">Hunter Control Panel</h2>
          
          <div className="grid gap-6">
            <button className="flex items-center gap-6 p-6 group hover:bg-main/5 transition-all transform -skew-x-6 border border-transparent hover:border-main/20 text-left">
              <Settings className="w-8 h-8 text-white/20 group-hover:text-main transition-colors" />
              <div>
                <h4 className="text-lg font-black uppercase italic text-white leading-none">System Settings</h4>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20">Modify interface & protocols</p>
              </div>
            </button>

            <button 
              onClick={onLogout}
              className="flex items-center gap-6 p-6 group hover:bg-neutral-900 transition-all transform -skew-x-6 border border-white/5 hover:border-red-500/50 text-left"
            >
              <LogOut className="w-8 h-8 text-white/20 group-hover:text-red-500 transition-colors" />
              <div>
                <h4 className="text-lg font-black uppercase italic text-red-500/80 group-hover:text-red-500 leading-none">Emergency Logout</h4>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20">Terminate current session</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;




