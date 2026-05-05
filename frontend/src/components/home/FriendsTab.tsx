import { X, Check, Users, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../LanguageContext';

interface FriendsTabProps {
  friends: any[];
  pendingRequests: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchResult: any;
  searchStatus: string | null;
  isSearching: boolean;
  isAdding: boolean;
  onSearch: () => void;
  onAddFriend: (id: number) => void;
  onAcceptRequest: (id: number) => void;
  onRejectRequest: (id: number) => void;
  onNavigate?: (tab: string, params?: any) => void;
}

export default function FriendsTab({
  friends,
  pendingRequests,
  searchQuery,
  setSearchQuery,
  searchResult,
  searchStatus,
  isSearching,
  isAdding,
  onSearch,
  onAddFriend,
  onAcceptRequest,
  onRejectRequest,
  onNavigate
}: FriendsTabProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary italic border-l-4 border-border pl-4">{t('home.search_hunter')}</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder={t('home.enter_username')}
              className="w-full bg-neutral-black border-4 border-border p-4 text-text-main font-black italic uppercase focus:border-main outline-none transition-all"
            />
          </div>
          <button
            onClick={onSearch}
            disabled={isSearching}
            className="bg-main text-neutral-black px-8 font-black italic uppercase text-xs hover:bg-neutral-white hover:text-neutral-black transition-all shadow-[4px_4px_0px_var(--neutral-white)] disabled:opacity-50"
          >
            {isSearching ? '...' : t('home.scan')}
          </button>
        </div>

        <AnimatePresence>
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => onNavigate?.('profile', { targetId: searchResult.id })}
              className="bg-neutral-black border-4 border-neutral-white p-4 sm:p-6 shadow-[8px_8px_0px_var(--main-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group cursor-pointer hover:bg-surface transition-all"
            >
              <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-neutral-black border-2 border-border flex items-center justify-center text-lg font-black text-text-secondary group-hover:text-main group-hover:border-main/50 transition-all overflow-hidden">
                  {searchResult.profilePic ? (
                    <img src={searchResult.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    searchResult.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg sm:text-xl font-black italic uppercase text-text-main group-hover:text-main transition-colors truncate">{searchResult.username}</h4>
                  <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em]">{t('common.rank')} {searchResult.rank || 'E'}</p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                {searchStatus === 'SELF' ? (
                  <span className="text-[10px] font-black italic uppercase text-text-secondary bg-surface px-4 py-2 border-2 border-border whitespace-nowrap">{t('profile.it_is_you') || 'SYSTEM: SELF'}</span>
                ) : searchStatus === 'ACCEPTED' ? (
                  <span className="text-[10px] font-black italic uppercase text-main bg-main/10 px-4 py-2 border-2 border-main/50 whitespace-nowrap">{t('profile.already_friends')}</span>
                ) : searchStatus === 'PENDING' ? (
                  <span className="text-[10px] font-black italic uppercase text-text-secondary bg-surface px-4 py-2 border-2 border-border whitespace-nowrap">{t('profile.request_sent')}</span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddFriend(searchResult.id);
                    }}
                    disabled={isAdding}
                    className="w-full sm:w-auto bg-main text-neutral-black px-6 py-3 font-black italic uppercase text-xs hover:bg-neutral-white hover:text-neutral-black transition-all shadow-[4px_4px_0px_var(--neutral-white)] active:shadow-none active:translate-x-1 active:translate-y-1 whitespace-nowrap"
                  >
                    {isAdding ? t('profile.processing') : t('profile.add_friend')}
                  </button>
                )}
              </div>
            </motion.div>
          )}
          {!searchResult && searchStatus === 'NOT_FOUND' && !isSearching && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-black text-red-500 uppercase italic tracking-[0.3em] bg-red-500/5 p-4 border-l-4 border-red-500"
            >
              {t('home.hunter_not_found') || 'SYSTEM ERROR: HUNTER NOT FOUND'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {pendingRequests && pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-main italic border-l-4 border-main pl-4">{t('home.incoming_protocols')}</h3>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingRequests.map((req: any, i: number) => (
              <div key={`req-${i}`} className="bg-main/5 border-2 border-main/20 p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm border-2 border-main/30 bg-main/10 flex items-center justify-center text-sm font-black text-main transform -rotate-3">
                    {(req.sender?.username ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black text-text-main italic uppercase">{req.sender?.username ?? t('common.hunter')}</p>
                    <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">{t('home.requesting_access')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => onRejectRequest(req.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/30 transition-all rounded-sm">
                    <X className="w-5 h-5" />
                  </button>
                  <button onClick={() => onAcceptRequest(req.id)} className="p-2.5 bg-main/10 hover:bg-main text-main hover:text-black border border-main/30 transition-all rounded-sm">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary italic border-l-4 border-border pl-4">{t('rankings.tabs.friends')}</h3>
        {friends.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend, i) => (
              <div
                key={i}
                onClick={() => onNavigate?.('profile', { targetId: friend.id })}
                className="bg-neutral-black border-2 border-border p-4 flex items-center justify-between hover:bg-surface hover:border-main/40 transition-all cursor-pointer group rounded-sm shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-sm border border-border bg-neutral-black flex items-center justify-center text-xs font-black text-text-secondary group-hover:text-main group-hover:border-main/40 transition-all">
                    {(friend.username ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black text-text-main italic uppercase group-hover:text-main transition-colors">{friend.username ?? t('common.hunter')}</p>
                    <p className="text-[9px] text-text-secondary uppercase tracking-widest font-black">{t('common.rank')} {friend.rank || 'E'}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-border group-hover:text-main transition-all transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-6 border-2 border-dashed border-border rounded-sm">
            <Users className="w-16 h-16 text-text-secondary opacity-20" />
            <div className="text-center">
              <p className="text-xs font-black text-text-secondary uppercase tracking-[0.4em] italic mb-4">{t('home.alone')}</p>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] italic mb-4">{t('home.find_friends')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
