import { FC, useState, useEffect, ChangeEvent } from 'react';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { JSON_TEMPLATES } from './constants';

interface ApiError {
  status: string | number;
  statusText?: string;
  message: string;
}

interface SwaggerBlockProps {
  method: string;
  title: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  entity: string;
  type?: string;
  onDataReceived?: (data: any[]) => void;
}

export const SwaggerBlock: FC<SwaggerBlockProps> = ({
  method, title, colorClass, borderClass, bgClass, entity, type = 'all', onDataReceived
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [testId, setTestId] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>('');
  const [showRaw, setShowRaw] = useState<boolean>(false);

  useEffect(() => {
    if (isExpanded && (method === 'post' || method === 'put') && !requestBody) {
      setRequestBody(JSON.stringify(JSON_TEMPLATES[entity] || {}, null, 2));
    }
  }, [isExpanded, entity, method, requestBody]);

  const execute = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await adminService.executeAdminRequest(entity, type, method, testId, requestBody);
      const finalData = Array.isArray(result) ? result : (result ? [result] : { success: true, message: result });
      setData(finalData as any[]);
      if (type === 'all' && onDataReceived) {
        onDataReceived(finalData as any[]);
      }
    } catch (err: any) {
      setError({
        status: err.status || 'ERROR',
        statusText: err.statusText,
        message: err.message || JSON.stringify(err)
      });
    } finally {
      setLoading(false);
    }
  };

  const getEndpointLabel = () => {
    if (type === 'custom-top10') return '/api/admin/users/top10';
    if (type === 'custom-league-players') return `/api/admin/leagues/{id}/players`;
    if (type === 'custom-league-generate') return `/api/leagues/generate?maxUsersPerLeague={n}`;
    if (type === 'users-custom-quests') return `/api/admin/users/{id}/custom-quests`;
    if (type === 'users-custom-stats') return `/api/user/{id}/stats`;
    if (type === 'users-items') return `/api/user/{id}/items`;
    if (type === 'users-titles') return `/api/user/{id}/titles`;
    if (type === 'users-league-players') return `/api/user/{id}/league-players`;
    if (type === 'social-request') return `/api/social/friends/request?senderId={n}&receiverId={n}`;
    if (type === 'social-accept') return `/api/social/friends/accept/{id}`;
    if (type === 'social-list') return `/api/social/friends/{id}`;
    if (type === 'quest-complete') return `/api/quests/progress/{id}/complete`;
    if (type === 'quest-start') return `/api/quests/{questId}/start?userId={n}`;
    if (type === 'quest-active') return `/api/quests/active/{id}`;
    if (type === 'quest-system-pool') return `/api/admin/quests/generate-system-pool`;
    if (type === 'quest-assign-dailies') return `/api/admin/quests/assign-daily-mandatories`;
    if (type === 'comp-monthly') return `/api/admin/competitive/monthly-update`;
    if (type === 'comp-season') return `/api/admin/competitive/season-reset`;
    if (type === 'comp-ranks') return `/api/admin/competitive/refresh-ranks`;
    if (type === 'mod-muted') return `/api/admin/moderation/muted`;
    if (type === 'mod-unmute') return `/api/admin/moderation/unmute/{id}`;
    if (type === 'mod-mute') return `/api/admin/moderation/mute/{id}`;
    if (type === 'shop-buy-item') return `/api/shop/purchase/item/{userId}/{itemId}`;
    if (type === 'users-distribute-stats') return `/api/user/{id}/distribute-stats`;
    return `/api/admin/${entity}${(type === 'id' || method === 'delete' || method === 'put') ? '/{id}' : ''}`;
  };

  return (
    <div className={`mb-4 border-2 ${borderClass} rounded-sm overflow-hidden transition-all duration-300`}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-4 py-2 flex items-center gap-4 cursor-pointer ${bgClass}`}
      >
        <span className={`px-2 py-0.5 text-[10px] font-black rounded-sm text-neutral-white min-w-[60px] text-center ${colorClass}`}>
          {method.toUpperCase()}
        </span>
        <span className="text-xs font-bold font-mono">
          {getEndpointLabel()}
        </span>
        <span className="text-[10px] opacity-60 ml-auto uppercase font-black">{title}</span>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-4 bg-neutral-black/40 font-mono text-[11px]">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <span className="opacity-70 uppercase tracking-widest text-[9px]">Parameters & Payload</span>
            <button
              onClick={execute}
              disabled={loading}
              className="px-3 py-1 bg-surface/10 hover:bg-surface/20 rounded text-[9px] font-black italic text-orange-500 transition-all border border-border"
            >
              {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : "EXECUTE"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3">
              {(type === 'id' || method === 'delete' || method === 'put' || type === 'custom-league-players' || type === 'custom-league-generate' || type === 'users-custom-quests' || type === 'users-custom-stats' || type === 'users-items' || type === 'users-titles' || type === 'users-league-players' || type === 'users-distribute-stats' || type === 'social-accept' || type === 'social-list' || type === 'quest-complete' || type === 'quest-start' || type === 'quest-active' || type === 'mod-unmute' || type === 'mod-mute' || type === 'shop-buy-item' || type === 'shop-buy-title') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] opacity-40 uppercase font-black">
                    {type === 'custom-league-generate' ? 'Max Players Per League' :
                      (type === 'quest-complete' || type === 'quest-start' || type === 'quest-active') ? 'Progress / Quest / User ID (Required)' :
                        (type === 'mod-unmute' || type === 'mod-mute') ? 'Target User ID (Required)' :
                          (type === 'shop-buy-item' || type === 'shop-buy-title') ? 'Target IDs (Format: userId,itemId/titleId)' :
                            (type === 'users-custom-stats' || type === 'users-items' || type === 'users-titles' || type === 'users-league-players' || type === 'users-distribute-stats') ? 'User ID (Required)' :
                              'Record / User / Request ID (Required)'}
                  </label>
                  <input
                    className="bg-surface border border-border p-2 text-text-main w-full outline-none focus:border-orange-500/50 font-mono text-xs"
                    placeholder={type === 'custom-league-generate' ? "e.g. 5" : "e.g. 1"}
                    value={testId}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTestId(e.target.value)}
                  />
                </div>
              )}

              {(method === 'post' || method === 'put') && type !== 'mod-unmute' && type !== 'mod-mute' && type !== 'shop-buy-item' && type !== 'shop-buy-title' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] opacity-40 uppercase font-black">Request Body (JSON)</label>
                  <textarea
                    className="bg-surface border border-border p-2 text-text-main w-full h-32 outline-none focus:border-orange-500/50 font-mono text-xs resize-none"
                    placeholder='{ "name": "New Entity", ... }'
                    value={requestBody}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRequestBody(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="mt-2 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[8px] opacity-40 uppercase font-black block">Response</label>
                {data && type === 'custom-top10' && (
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="text-[9px] px-2 py-0.5 bg-orange-500/20 text-orange-500 border border-orange-500/30 font-black italic hover:bg-orange-500 hover:text-black transition-all"
                  >
                    {showRaw ? "VIEW LEADERBOARD" : "VIEW RAW JSON"}
                  </button>
                )}
              </div>

              {loading && <div className="p-4 text-center opacity-50 animate-pulse uppercase font-black text-xs">Awaiting Server Response...</div>}

              {error && (
                <div className="p-4 bg-red-950/40 border border-red-500/50 rounded animate-in slide-in-from-top-2">
                  <div className="text-red-500 font-black mb-1 text-xs">ERROR {error.status || '500'} {error.statusText || ''}</div>
                  <pre className="text-red-300 whitespace-pre-wrap text-[10px] leading-relaxed italic">
                    {error.message || JSON.stringify(error, null, 2)}
                  </pre>
                </div>
              )}

              {data && type === 'custom-top10' && !showRaw && (
                <div className="mt-4 border border-border rounded overflow-hidden animate-in zoom-in-95 duration-300">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-surface italic text-text-secondary opacity-50">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">User</th>
                        <th className="p-2">Stats</th>
                        <th className="p-2 text-right">User Rank</th>
                        <th className="p-2 text-right">Season Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.map((u: any, idx: number) => (
                        <tr key={u.id} className="hover:bg-surface">
                          <td className="p-2 font-black text-orange-500">{idx + 1}</td>
                          <td className="p-2">
                            <div className="font-bold text-text-main">{u.username}</div>
                            <div className="opacity-40 text-[8px] uppercase text-text-secondary">{u.title || 'Warrior'}</div>
                          </td>
                          <td className="p-2 opacity-50 text-text-secondary">Lvl {u.level}</td>
                          <td className="p-2 text-right">
                            <span className={`px-2 py-0.5 rounded-sm font-black ${u.rank === 'S' ? 'bg-yellow-500 text-neutral-black shadow-[0_0_5px_yellow]' :
                              u.rank === 'A' ? 'bg-purple-500 text-neutral-white' : 'bg-surface border border-border text-text-main'
                              }`}>
                              {u.rank || 'E'}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono text-orange-400">{(u.seasonPoints || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {data && (type !== 'custom-top10' || showRaw) && (
                <pre className="max-h-80 overflow-y-auto custom-scrollbar bg-surface p-3 rounded border border-border animate-in fade-in text-main font-black text-[10px]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}

              {!data && !error && !loading && (
                <div className="p-8 text-center border border-dashed border-white/5 opacity-20 italic text-[10px]">
                  No execution performed yet for this endpoint.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
