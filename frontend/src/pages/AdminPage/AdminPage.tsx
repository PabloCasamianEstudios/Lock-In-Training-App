import { useState, useEffect, type FC, type ChangeEvent } from 'react';
import { ChevronDown, ChevronRight, Trash2, Database, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import PopupWindow from '../../components/common/PopupWindow';
import PageLayout from '../../components/common/PageLayout';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

interface JsonTemplates {
  [key: string]: Record<string, unknown>;
}

const JSON_TEMPLATES: JsonTemplates = {
  users: {
    username: "",
    email: "",
    password: "password123",
    role: "USER",
    rank: "BRONZE",
    level: 1,
    xp: 0,
    coins: 0,
    streak: 0,
    weight: 75.0,
    height: 180.0,
    gender: "MALE",
    birthDate: "1995-01-01"
  },
  quests: {
    title: "New Daily Quest",
    description: "Complete exercise routine",
    type: "DAILY",
    rankDifficulty: "C",
    goldReward: 50,
    xpReward: 100,
    steps: [
      {
        exercise: { id: 1 },
        series: 3,
        repetitions: 10
      }
    ]
  },
  exercises: {
    name: "Pushups",
    type: "Strength",
    difficulty: "Beginner",
    baseReps: 10,
    baseDuration: 0,
    baseWeight: 0.0
  },
  achievements: {
    title: "Early Bird",
    description: "Complete a workout before 7 AM",
    iconUrl: "https://example.com/icon.png"
  },
  stats: {
    name: "Strength",
    description: "Physical power and muscle force"
  },
  leagues: {
    rankLevel: 1,
    rank: "BRONZE",
    reward: 500,
    xpReward: 1000
  },
  "quest-start": {
    userId: 1
  },
  tips: {
    title: "Hydration Tip",
    description: "Drink at least 2L of water daily",
    imageUrl: "https://example.com/tip.png"
  },
  titles: {
    name: "Iron Soul",
    description: "Unlocked after 100 workouts"
  },
  social: {
    senderId: 1,
    receiverId: 2
  },
  moderation: {
    userId: 1
  },
  "distribute-stats": {
    "AGI": 2,
    "VIT": 2,
    "INT": 0,
    "LUK": 0,
    "SPD": 0
  }
};

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

const SwaggerBlock: FC<SwaggerBlockProps> = ({ method, title, colorClass, borderClass, bgClass, entity, type = 'all', onDataReceived }) => {
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
    const token = localStorage.getItem('lockin_token');

    try {
      /* --- URL CONSTRUCTION ZONE --- */
      let url = `${API_BASE_URL}/api/admin/${entity}`;

      if (type === 'custom-top10') {
        url = `${API_BASE_URL}/api/admin/users/top10`;
      } else if (type === 'custom-league-players') {
        if (!testId) throw new Error("League ID is required");
        url = `${API_BASE_URL}/api/admin/leagues/${testId}/players`;
      } else if (type === 'custom-league-generate') {
        const max = testId || '5';
        url = `${API_BASE_URL}/api/leagues/generate?maxUsersPerLeague=${max}`;
      } else if (type === 'users-custom-quests') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/admin/users/${testId}/custom-quests`;
      } else if (type === 'social-request') {
        const body = JSON.parse(requestBody) as { senderId: number; receiverId: number };
        url = `${API_BASE_URL}/api/social/friends/request?senderId=${body.senderId}&receiverId=${body.receiverId}`;
      } else if (type === 'social-accept') {
        if (!testId) throw new Error("Request ID is required");
        url = `${API_BASE_URL}/api/social/friends/accept/${testId}`;
      } else if (type === 'social-list') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/social/friends/${testId}`;
      } else if (type === 'quest-complete') {
        if (!testId) throw new Error("Progress ID is required");
        url = `${API_BASE_URL}/api/quests/progress/${testId}/complete`;
      } else if (type === 'quest-start') {
        const body = JSON.parse(requestBody) as { userId: number };
        url = `${API_BASE_URL}/api/quests/${testId}/start?userId=${body.userId}`;
      } else if (type === 'quest-active') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/quests/active/${testId}`;
      } else if (type === 'quest-system-pool') {
        url = `${API_BASE_URL}/api/admin/quests/generate-system-pool`;
      } else if (type === 'quest-assign-dailies') {
        url = `${API_BASE_URL}/api/admin/quests/assign-daily-mandatories`;
      } else if (type === 'comp-monthly') {
        url = `${API_BASE_URL}/api/admin/competitive/monthly-update`;
      } else if (type === 'comp-season') {
        url = `${API_BASE_URL}/api/admin/competitive/season-reset`;
      } else if (type === 'comp-ranks') {
        url = `${API_BASE_URL}/api/admin/competitive/refresh-ranks`;
      } else if (type === 'mod-muted') {
        url = `${API_BASE_URL}/api/admin/moderation/muted`;
      } else if (type === 'mod-unmute') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/admin/moderation/unmute/${testId}`;
      } else if (type === 'mod-mute') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/admin/moderation/mute/${testId}`;
      } else if (type === 'shop-list') {
        url = `${API_BASE_URL}/api/shop/items`;
      } else if (type === 'shop-buy-item') {
        const [uId, iId] = testId.split(',');
        if (!uId || !iId) throw new Error("Format: userId,itemId");
        url = `${API_BASE_URL}/api/shop/purchase/item/${uId}/${iId}`;
      } else if (type === 'shop-buy-title') {
        const [uId, tId] = testId.split(',');
        if (!uId || !tId) throw new Error("Format: userId,titleId");
        url = `${API_BASE_URL}/api/shop/purchase/title/${uId}/${tId}`;
      } else if (type === 'users-custom-stats') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/user/${testId}/stats`;
      } else if (type === 'users-items') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/user/${testId}/items`;
      } else if (type === 'users-titles') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/user/${testId}/titles`;
      } else if (type === 'users-league-players') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/user/${testId}/league-players`;
      } else if (type === 'users-distribute-stats') {
        if (!testId) throw new Error("User ID is required");
        url = `${API_BASE_URL}/api/user/${testId}/distribute-stats`;
      } else if (type === 'id' || method === 'delete' || method === 'put') {
        if (!testId) throw new Error("ID is required for this operation");
        url += `/${testId}`;
      }

      const options: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (method === 'post' || method === 'put') {
        try {
          if (requestBody) {
            options.body = JSON.stringify(JSON.parse(requestBody));
          }
        } catch {
          throw new Error("Invalid JSON format in Request Body");
        }
      }

      const response = await fetch(url, options);

      let result: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      if (response.ok) {
        const finalData = Array.isArray(result) ? result : (result ? [result] : { success: true, message: result });
        setData(finalData as any[]);
        if (type === 'all' && onDataReceived) {
          onDataReceived(finalData as any[]);
        }
      } else {
        const errorMsg = typeof result === 'string' ? result : (result.message || result.error || JSON.stringify(result));
        setError({
          status: response.status,
          statusText: response.statusText,
          message: errorMsg
        });
      }
    } catch (err: any) {
      setError({
        status: 'CLIENT_ERROR',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mb-4 border-2 ${borderClass} rounded-sm overflow-hidden transition-all duration-300`}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-4 py-2 flex items-center gap-4 cursor-pointer ${bgClass}`}
      >
        <span className={`px-2 py-0.5 text-[10px] font-black rounded-sm text-white min-w-[60px] text-center ${colorClass}`}>
          {method.toUpperCase()}
        </span>
        <span className="text-xs font-bold font-mono">
          {type === 'custom-top10' ? '/api/admin/users/top10' :
            type === 'custom-league-players' ? `/api/admin/leagues/{id}/players` :
              type === 'custom-league-generate' ? `/api/leagues/generate?maxUsersPerLeague={n}` :
                type === 'users-custom-quests' ? `/api/admin/users/{id}/custom-quests` :
                  type === 'users-custom-stats' ? `/api/user/{id}/stats` :
                    type === 'users-items' ? `/api/user/{id}/items` :
                      type === 'users-titles' ? `/api/user/{id}/titles` :
                        type === 'users-league-players' ? `/api/user/{id}/league-players` :
                          type === 'social-request' ? `/api/social/friends/request?senderId={n}&receiverId={n}` :
                      type === 'social-accept' ? `/api/social/friends/accept/{id}` :
                        type === 'social-list' ? `/api/social/friends/{id}` :
                          type === 'quest-complete' ? `/api/quests/progress/{id}/complete` :
                            type === 'quest-start' ? `/api/quests/{questId}/start?userId={n}` :
                              type === 'quest-active' ? `/api/quests/active/{id}` :
                                type === 'quest-system-pool' ? `/api/admin/quests/generate-system-pool` :
                                  type === 'comp-monthly' ? `/api/admin/competitive/monthly-update` :
                                  type === 'comp-season' ? `/api/admin/competitive/season-reset` :
                                    type === 'comp-ranks' ? `/api/admin/competitive/refresh-ranks` :
                                    type === 'users-distribute-stats' ? `/api/user/{id}/distribute-stats` :
                                      `/api/admin/${entity}${(type === 'id' || method === 'delete' || method === 'put') ? '/{id}' : ''}`}
        </span>
        <span className="text-[10px] opacity-60 ml-auto uppercase font-black">{title}</span>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-4 bg-black/40 font-mono text-[11px]">
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
            <span className="opacity-70 uppercase tracking-widest text-[9px]">Parameters & Payload</span>
            <button
              onClick={execute}
              disabled={loading}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[9px] font-black italic text-orange-500 transition-all border border-white/10"
            >
              {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : "EXECUTE"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Input section */}
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
                    className="bg-white/5 border border-white/10 p-2 text-white w-full outline-none focus:border-orange-500/50 font-mono text-xs"
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
                    className="bg-white/5 border border-white/10 p-2 text-white w-full h-32 outline-none focus:border-orange-500/50 font-mono text-xs resize-none"
                    placeholder='{ "name": "New Entity", ... }'
                    value={requestBody}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRequestBody(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Response section */}
            <div className="mt-2 border-t border-white/5 pt-4">
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
                <div className="mt-4 border border-white/10 rounded overflow-hidden animate-in zoom-in-95 duration-300">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-white/10 italic text-white/50">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">User</th>
                        <th className="p-2">Stats</th>
                        <th className="p-2 text-right">User Rank</th>
                        <th className="p-2 text-right">Season Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.map((u: any, idx: number) => (
                        <tr key={u.id} className="hover:bg-white/5">
                          <td className="p-2 font-black text-orange-500">{idx + 1}</td>
                          <td className="p-2">
                            <div className="font-bold text-white">{u.username}</div>
                            <div className="opacity-40 text-[8px] uppercase">{u.title || 'Warrior'}</div>
                          </td>
                          <td className="p-2 opacity-50">Lvl {u.level}</td>
                          <td className="p-2 text-right">
                            <span className={`px-2 py-0.5 rounded-sm font-black ${u.rank === 'S' ? 'bg-yellow-500 text-black shadow-[0_0_5px_yellow]' :
                                u.rank === 'A' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white'
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
                <pre className="max-h-80 overflow-y-auto custom-scrollbar bg-black/30 p-3 rounded border border-white/5 animate-in fade-in text-green-400/90 text-[10px]">
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

interface Entity {
  id: string;
  name: string;
}

const AdminPage: FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>('users');
  const [globalData, setGlobalData] = useState<any[]>([]);
  const [systemPopup, setSystemPopup] = useState<{ isOpen: boolean; title: string; message: string; type: 'INFO' | 'DANGER'; onConfirm?: () => void } | null>(null);

  const closePopup = () => setSystemPopup(null);

  const entities: Entity[] = [
    { id: 'users', name: 'Users' },
    { id: 'quests', name: 'Quests' },
    { id: 'exercises', name: 'Exercises' },
    { id: 'achievements', name: 'Achievements' },
    { id: 'stats', name: 'Stats' },
    { id: 'leagues', name: 'Leagues' },
    { id: 'tips', name: 'Tips' },
    { id: 'titles', name: 'Titles' },
    { id: 'social', name: 'Social' },
    { id: 'quest-progress', name: 'Quest Progression' },
    { id: 'competitive', name: 'Competitive Automation' },
    { id: 'moderation', name: 'Security & Moderation' },
    { id: 'shop', name: 'Shop & Inventory' },
  ];

  const handleDeleteQuick = async (id: number): Promise<void> => {
    setSystemPopup({
      isOpen: true,
      title: 'CONFIRM DELETION',
      message: `ARE YOU SURE YOU WANT TO DELETE RECORD #${id} FROM ${selectedEntity.toUpperCase()}? THIS ACTION IS IRREVERSIBLE.`,
      type: 'DANGER',
      onConfirm: () => performDelete(id)
    });
  };

  const performDelete = async (id: number): Promise<void> => {
    const token = localStorage.getItem('lockin_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${selectedEntity}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.text();

      if (response.ok) {
        setSystemPopup({
          isOpen: true,
          title: 'PURGE COMPLETE',
          message: 'THE RECORD HAS BEEN PERMANENTLY REMOVED FROM THE DATABASE.',
          type: 'INFO'
        });
      } else {
        setSystemPopup({
          isOpen: true,
          title: 'DELETE FAILED',
          message: result || 'THE SERVER REJECTED THE DELETION REQUEST.',
          type: 'DANGER'
        });
      }
    } catch (error: any) {
      console.error('Error deleting record:', error);
      setSystemPopup({
        isOpen: true,
        title: 'PROTOCOL ERROR',
        message: error.message || 'UNABLE TO COMMUNICATE WITH THE CORE SYSTEM.',
        type: 'DANGER'
      });
    }
  };

  return (
    <PageLayout 
      title="ADMIN PANEL" 
      subtitle="CENTRAL CORE OVERRIDE" 
      icon={Database}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-8">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <label className="text-[10px] font-black uppercase opacity-30 mb-2 tracking-[0.3em] italic border-l-4 border-orange-500 pl-4">Repositories</label>
          {entities.map(e => (
            <button
              key={e.id}
              onClick={() => { setSelectedEntity(e.id); setGlobalData([]); }}
              className={`p-4 text-left text-[11px] font-black uppercase tracking-[0.2em] transition-all skew-x-[-15deg] border-2 group relative overflow-hidden ${selectedEntity === e.id
                ? 'bg-orange-500 border-orange-500 text-black shadow-[6px_6px_0_white]'
                : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white bg-white/5'
                }`}
            >
              <span className="relative z-10 skew-x-[15deg] inline-block">{e.name}</span>
              {selectedEntity === e.id && (
                <div className="absolute top-0 left-[-100%] w-full h-full bg-white/20 skew-x-[45deg] animate-[shine_2s_infinite]" />
              )}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col mb-10 gap-2 border-b-2 border-white/10 pb-6">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-white">{selectedEntity}</h2>
            <div className="flex items-center gap-3 text-[10px] opacity-100 font-mono italic mt-2">
              <span className="bg-white/5 px-2 py-0.5 rounded-sm text-white/40">ENDPOINT BASE</span>
              <span className="text-orange-500 font-bold">/api/admin/{selectedEntity}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* --- SPECIAL ENDPOINTS ZONE --- */}
            {selectedEntity === 'users' && (
              <>
                <SwaggerBlock
                  key="users-custom-top10"
                  method="get" title="Ranking: Top 10 Users" entity="users" type="custom-top10"
                  colorClass="bg-purple-600" borderClass="border-purple-600/20" bgClass="bg-purple-600/10 hover:bg-purple-600/20"
                />
                <SwaggerBlock
                  key="users-custom-quests"
                  method="get" title="Profile: User Custom Quests" entity="users" type="users-custom-quests"
                  colorClass="bg-blue-600" borderClass="border-blue-600/20" bgClass="bg-blue-600/10 hover:bg-blue-600/20"
                />
                <SwaggerBlock
                  key="users-custom-stats"
                  method="get" title="Profile: User Physical Stats" entity="users" type="users-custom-stats"
                  colorClass="bg-teal-600" borderClass="border-teal-600/20" bgClass="bg-teal-600/10 hover:bg-teal-600/20"
                />
                <SwaggerBlock
                  key="users-items"
                  method="get" title="Inventory: User Owned Items" entity="users" type="users-items"
                  colorClass="bg-cyan-600" borderClass="border-cyan-600/20" bgClass="bg-cyan-600/10 hover:bg-cyan-600/20"
                />
                <SwaggerBlock
                  key="users-titles"
                  method="get" title="Inventory: User Owned Titles" entity="users" type="users-titles"
                  colorClass="bg-cyan-700" borderClass="border-cyan-700/20" bgClass="bg-cyan-700/10 hover:bg-cyan-700/20"
                />
                <SwaggerBlock
                  key="users-league-players"
                  method="get" title="Ranking: League Group Members" entity="users" type="users-league-players"
                  colorClass="bg-indigo-600" borderClass="border-indigo-600/20" bgClass="bg-indigo-600/10 hover:bg-indigo-600/20"
                  onDataReceived={(data) => setGlobalData(data)}
                />
                <SwaggerBlock
                  key="users-distribute-stats"
                  method="post" title="Profile: Distribute Level Points" entity="distribute-stats" type="users-distribute-stats"
                  colorClass="bg-orange-700" borderClass="border-orange-700/20" bgClass="bg-orange-700/10 hover:bg-orange-700/20"
                />
              </>
            )}

            {selectedEntity === 'leagues' && (
              <>
                <SwaggerBlock
                  key="leagues-custom-players"
                  method="get" title="Ranking: League Players" entity="leagues" type="custom-league-players"
                  colorClass="bg-purple-700" borderClass="border-purple-700/20" bgClass="bg-purple-700/10 hover:bg-purple-700/20"
                />
                <SwaggerBlock
                  key="leagues-custom-generate"
                  method="post" title="System: Generate Leagues" entity="leagues" type="custom-league-generate"
                  colorClass="bg-red-700" borderClass="border-red-700/20" bgClass="bg-red-700/10 hover:bg-red-700/20"
                />
              </>
            )}

            {selectedEntity === 'social' && (
              <>
                <SwaggerBlock
                  key="social-request"
                  method="post" title="Friends: Send Request" entity="social" type="social-request"
                  colorClass="bg-pink-600" borderClass="border-pink-600/20" bgClass="bg-pink-600/10 hover:bg-pink-600/20"
                />
                <SwaggerBlock
                  key="social-accept"
                  method="post" title="Friends: Accept Request" entity="social" type="social-accept"
                  colorClass="bg-pink-700" borderClass="border-pink-700/20" bgClass="bg-pink-700/10 hover:bg-pink-700/20"
                />
                <SwaggerBlock
                  key="social-list"
                  method="get" title="Friends: List Accepted" entity="social" type="social-list"
                  colorClass="bg-pink-800" borderClass="border-pink-800/20" bgClass="bg-pink-800/10 hover:bg-pink-800/20"
                />
              </>
            )}

            {selectedEntity === 'quest-progress' && (
              <>
                <SwaggerBlock
                  key="quest-start"
                  method="post" title="Flow: Start/Accept Quest" entity="quest-start" type="quest-start"
                  colorClass="bg-yellow-500" borderClass="border-yellow-500/20" bgClass="bg-yellow-500/10 hover:bg-yellow-500/20"
                />
                <SwaggerBlock
                  key="quest-active"
                  method="get" title="Flow: List Active Quests" entity="quests" type="quest-active"
                  colorClass="bg-yellow-700" borderClass="border-yellow-700/20" bgClass="bg-yellow-700/10 hover:bg-yellow-700/20"
                />
                <SwaggerBlock
                  key="quest-complete"
                  method="post" title="Rewards: Complete Quest" entity="quests" type="quest-complete"
                  colorClass="bg-yellow-600" borderClass="border-yellow-600/20" bgClass="bg-yellow-600/10 hover:bg-yellow-600/20"
                />
              </>
            )}

            {selectedEntity === 'quests' && (
              <>
                <SwaggerBlock
                  key="quest-system-pool"
                  method="post" title="System: Generate Global Pool (300 Quests)" entity="quests" type="quest-system-pool"
                  colorClass="bg-orange-600" borderClass="border-orange-600/20" bgClass="bg-orange-600/10 hover:bg-orange-600/20"
                />
                <SwaggerBlock
                  key="quest-assign-dailies"
                  method="post" title="System: Assign Mandatory Dailies (All Users)" entity="quests" type="quest-assign-dailies"
                  colorClass="bg-orange-800" borderClass="border-orange-800/20" bgClass="bg-orange-800/10 hover:bg-orange-800/20"
                />
              </>
            )}

            {selectedEntity === 'shop' && (
              <>
                <SwaggerBlock
                  key="shop-list"
                  method="get" title="Shop: List All Items" entity="shop" type="shop-list"
                  colorClass="bg-amber-600" borderClass="border-amber-600/20" bgClass="bg-amber-600/10 hover:bg-amber-600/20"
                />
                <SwaggerBlock
                  key="shop-buy-item"
                  method="post" title="Shop: Buy Item (userId,itemId)" entity="shop" type="shop-buy-item"
                  colorClass="bg-amber-800" borderClass="border-amber-800/20" bgClass="bg-amber-800/10 hover:bg-amber-800/20"
                />
                <SwaggerBlock
                  key="shop-buy-title"
                  method="post" title="Shop: Buy Title (userId,titleId)" entity="shop" type="shop-buy-title"
                  colorClass="bg-amber-400" borderClass="border-amber-400/20" bgClass="bg-amber-400/10 hover:bg-amber-400/20"
                />
              </>
            )}

            {selectedEntity === 'moderation' && (
              <>
                <SwaggerBlock
                  key="mod-muted"
                  method="get" title="Integrity: List Muted Users" entity="moderation" type="mod-muted"
                  colorClass="bg-red-900" borderClass="border-red-900/20" bgClass="bg-red-900/10 hover:bg-red-900/20"
                />
                <SwaggerBlock
                  key="mod-unmute"
                  method="post" title="Integrity: Unmute/Restore User" entity="moderation" type="mod-unmute"
                  colorClass="bg-green-800" borderClass="border-green-800/20" bgClass="bg-green-800/10 hover:bg-green-800/20"
                />
                <SwaggerBlock
                  key="mod-mute"
                  method="post" title="Integrity: Manual Mute" entity="moderation" type="mod-mute"
                  colorClass="bg-red-600" borderClass="border-red-600/20" bgClass="bg-red-600/10 hover:bg-red-600/20"
                />
              </>
            )}

            {selectedEntity === 'competitive' && (
              <>
                <SwaggerBlock
                  key="comp-monthly"
                  method="post" title="Automation: End Month (Leagues)" entity="competitive" type="comp-monthly"
                  colorClass="bg-indigo-600" borderClass="border-indigo-600/20" bgClass="bg-indigo-600/10 hover:bg-indigo-600/20"
                />
                <SwaggerBlock
                  key="comp-season"
                  method="post" title="Automation: End Season (Hard Reset)" entity="competitive" type="comp-season"
                  colorClass="bg-indigo-800" borderClass="border-indigo-800/20" bgClass="bg-indigo-800/10 hover:bg-indigo-800/20"
                />
                <SwaggerBlock
                  key="comp-ranks"
                  method="post" title="Automation: Refresh Global Ranks" entity="competitive" type="comp-ranks"
                  colorClass="bg-indigo-400" borderClass="border-indigo-400/20" bgClass="bg-indigo-400/10 hover:bg-indigo-400/20"
                />
              </>
            )}

            {/* --- STANDARD CRUD ZONE --- */}
            <SwaggerBlock
              key={`${selectedEntity}-get-all`}
              method="get" title="List all records" entity={selectedEntity} type="all"
              colorClass="bg-green-600" borderClass="border-green-600/20" bgClass="bg-green-600/10 hover:bg-green-600/20"
              onDataReceived={(data) => setGlobalData(data)}
            />

            <SwaggerBlock
              key={`${selectedEntity}-get-id`}
              method="get" title="Find by ID" entity={selectedEntity} type="id"
              colorClass="bg-green-700" borderClass="border-green-700/20" bgClass="bg-green-700/10 hover:bg-green-700/20"
            />

            <SwaggerBlock
              key={`${selectedEntity}-post`}
              method="post" title="Create new entry" entity={selectedEntity} type="create"
              colorClass="bg-blue-600" borderClass="border-blue-600/20" bgClass="bg-blue-600/10 hover:bg-blue-600/20"
            />

            <SwaggerBlock
              key={`${selectedEntity}-put`}
              method="put" title="Update existing entry" entity={selectedEntity} type="update"
              colorClass="bg-amber-600" borderClass="border-amber-600/20" bgClass="bg-amber-600/10 hover:bg-amber-600/20"
            />

            <SwaggerBlock
              key={`${selectedEntity}-delete`}
              method="delete" title="Purge record" entity={selectedEntity} type="delete"
              colorClass="bg-red-600" borderClass="border-red-600/20" bgClass="bg-red-600/10 hover:bg-red-600/20"
            />
          </div>

          <div className="mt-16 group border-4 border-white/5 rounded-sm overflow-hidden bg-black/40 shadow-2xl">
            <div className="bg-white/5 p-5 flex items-center justify-between border-b-2 border-white/10 leading-none">
              <span className="font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-3 text-white/60">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_var(--main-color)]" />
                Quick View: {selectedEntity}
              </span>
              <span className="text-[9px] opacity-30 font-mono italic">Results from 'LIST ALL' execution</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-black/20">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 border-b-2 border-white/10 sticky top-0 z-10 backdrop-blur-xl">
                  <tr>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/30">ID</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/30">Preview Data</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-white/5">
                  {(globalData || []).map((item: any) => (
                    <tr key={item.id} className="hover:bg-white/[0.04] transition-all group/row">
                      <td className="p-5 font-mono text-[12px] text-orange-500/80 font-black italic">#{item.id}</td>
                      <td className="p-5">
                        <div className="text-[10px] text-white/40 font-mono truncate max-w-lg italic group-hover/row:text-white transition-colors">
                          {JSON.stringify(item).substring(0, 100)}...
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => handleDeleteQuick(item.id)}
                          className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-black px-4 py-2 rounded-sm transition-all duration-300 opacity-0 group-hover/row:opacity-100 border-2 border-red-600/30 transform -skew-x-12"
                          title="Quick Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(globalData && globalData.length === 0) && (
                    <tr><td colSpan={3} className="p-20 text-center text-white/10 italic text-[11px] tracking-[0.4em] uppercase font-black">Select an operation above and click EXECUTE to browse data</td></tr>
                  )}
                  {globalData === null && (
                    <tr><td colSpan={3} className="p-20 text-center text-white/5 italic text-[11px] tracking-[0.4em] uppercase font-black animate-pulse">System ready. Establish connection with API...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <PopupWindow
        isOpen={!!systemPopup?.isOpen}
        onClose={closePopup}
        title={systemPopup?.title}
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center text-center space-y-8 pt-4">
          <div className={`p-6 rounded-sm transform rotate-45 border-4 shadow-xl ${systemPopup?.type === 'DANGER' ? 'border-red-600 bg-red-600/10' : 'border-main bg-main/10'}`}>
            <div className="-rotate-45">
              {systemPopup?.type === 'DANGER' ? <AlertTriangle className="w-16 h-16 text-red-600" /> : <CheckCircle className="w-16 h-16 text-main" />}
            </div>
          </div>
          <p className="text-[11px] font-black uppercase italic tracking-[0.2em] text-white leading-relaxed font-mono px-4">
            {systemPopup?.message}
          </p>
          <div className="flex gap-4 w-full px-4 pb-4">
            {systemPopup?.onConfirm ? (
              <>
                <button
                  onClick={closePopup}
                  className="flex-1 py-4 border-2 border-white/20 text-[10px] font-black uppercase italic hover:bg-white/10 transition-all font-mono"
                >
                  ABORT
                </button>
                <button
                  onClick={() => {
                    systemPopup.onConfirm?.();
                    closePopup();
                  }}
                  className="flex-1 py-4 bg-red-600 text-black text-[10px] font-black uppercase italic hover:bg-red-500 transition-all shadow-[6px_6px_0px_white]"
                >
                  CONFIRM PURGE
                </button>
              </>
            ) : (
              <button
                onClick={closePopup}
                className="w-full py-5 bg-main text-black text-[11px] font-black uppercase italic shadow-[8px_8px_0px_white] hover:bg-white transition-all"
              >
                ACKNOWLEDGE
              </button>
            )}
          </div>
        </div>
      </PopupWindow>
    </PageLayout>
  );
};

export default AdminPage;
