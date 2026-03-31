import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Trash2, Database, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const JSON_TEMPLATES = {
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
    description: "Complete 30 pushups",
    type: "DAILY",
    rankDifficulty: "C",
    goldReward: 50,
    xpReward: 100
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
  tips: {
    title: "Hydration Tip",
    description: "Drink at least 2L of water daily",
    imageUrl: "https://example.com/tip.png"
  },
  titles: {
    name: "Iron Soul",
    description: "Unlocked after 100 workouts"
  }
};

const SwaggerBlock = ({ method, title, colorClass, borderClass, bgClass, entity, type = 'all', onDataReceived }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testId, setTestId] = useState('');
  const [requestBody, setRequestBody] = useState('');

  // Pre-fill template when block is expanded
  useEffect(() => {
    if (isExpanded && (method === 'post' || method === 'put') && !requestBody) {
      setRequestBody(JSON.stringify(JSON_TEMPLATES[entity] || {}, null, 2));
    }
  }, [isExpanded, entity, method]);

  const execute = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    const token = localStorage.getItem('lockin_token');

    try {
      let url = `${API_BASE_URL}/api/admin/${entity}`;
      if (type === 'id' || method === 'delete' || method === 'put') {
        if (!testId) throw new Error("ID is required for this operation");
        url += `/${testId}`;
      }

      const options = {
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
        } catch (e) {
          throw new Error("Invalid JSON format in Request Body");
        }
      }

      const response = await fetch(url, options);
      
      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      if (response.ok) {
        const finalData = Array.isArray(result) ? result : (result ? [result] : { success: true, message: result });
        setData(finalData);
        if (type === 'all' && onDataReceived) {
          onDataReceived(finalData);
        }
      } else {
        setError({
          status: response.status,
          statusText: response.statusText,
          message: result || 'Request failed'
        });
      }
    } catch (err) {
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
          /api/admin/{entity}{ (type === 'id' || method === 'delete' || method === 'put') ? '/{id}' : ''}
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
            {/* INPUTS SECTION */}
            <div className="grid grid-cols-1 gap-3">
              {(type === 'id' || method === 'delete' || method === 'put') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] opacity-40 uppercase font-black">Record ID (Required)</label>
                  <input 
                    className="bg-white/5 border border-white/10 p-2 text-white w-full outline-none focus:border-orange-500/50 font-mono text-xs" 
                    placeholder="e.g. 1"
                    value={testId}
                    onChange={(e) => setTestId(e.target.value)}
                  />
                </div>
              )}
              
              {(method === 'post' || method === 'put') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] opacity-40 uppercase font-black">Request Body (JSON)</label>
                  <textarea 
                    className="bg-white/5 border border-white/10 p-2 text-white w-full h-32 outline-none focus:border-orange-500/50 font-mono text-xs resize-none" 
                    placeholder='{ "name": "New Entity", ... }'
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* RESPONSE SECTION */}
            <div className="mt-2 border-t border-white/5 pt-4">
              <label className="text-[8px] opacity-40 uppercase font-black block mb-2">Response</label>
              
              {loading && <div className="p-4 text-center opacity-50 animate-pulse uppercase font-black text-xs">Awaiting Server Response...</div>}
              
              {error && (
                <div className="p-4 bg-red-950/40 border border-red-500/50 rounded animate-in slide-in-from-top-2">
                  <div className="text-red-500 font-black mb-1 text-xs">ERROR {error.status} {error.statusText}</div>
                  <pre className="text-red-300 whitespace-pre-wrap text-[10px] leading-relaxed italic">{error.message}</pre>
                </div>
              )}

              {data && (
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

const AdminPage = () => {
  const [selectedEntity, setSelectedEntity] = useState('users');
  const [globalData, setGlobalData] = useState([]); // Shared only for the bottom table

  const entities = [
    { id: 'users', name: 'Users' },
    { id: 'quests', name: 'Quests' },
    { id: 'exercises', name: 'Exercises' },
    { id: 'achievements', name: 'Achievements' },
    { id: 'stats', name: 'Stats' },
    { id: 'leagues', name: 'Leagues' },
    { id: 'tips', name: 'Tips' },
    { id: 'titles', name: 'Titles' },
  ];

  const handleDeleteQuick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    const token = localStorage.getItem('lockin_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${selectedEntity}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Deleted successfully. Refresh "List all" to see changes in the table.');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-4">
      <div className="flex items-center gap-3 border-b-4 border-white pb-6">
        <Database className="w-10 h-10 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
          Admin <span className="text-orange-500 text-glow">Panel</span>
        </h1>
        <div className="ml-auto flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 skew-x-[-15deg]">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-white/50 skew-x-[15deg]">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase opacity-30 mb-2 tracking-widest">Select Repository</label>
          {entities.map(e => (
            <button
              key={e.id}
              onClick={() => { setSelectedEntity(e.id); setGlobalData([]); }}
              className={`p-4 text-left text-xs font-black uppercase tracking-[0.2em] transition-all skew-x-[-15deg] border-2 group relative overflow-hidden ${selectedEntity === e.id
                  ? 'bg-orange-500 border-orange-500 text-black shadow-[6px_6px_0_white]'
                  : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                }`}
            >
              <span className="relative z-10 skew-x-[15deg] inline-block">{e.name}</span>
              {selectedEntity === e.id && (
                <div className="absolute top-0 left-[-100%] w-full h-full bg-white/20 skew-x-[45deg] animate-[shine_2s_infinite]" />
              )}
            </button>
          ))}
        </div>

        {/* SWAGGER UI CONTENT */}
        <div className="lg:col-span-3">
          <div className="flex flex-col mb-8 gap-1">
            <h2 className="text-3xl font-black uppercase tracking-tight leading-none">{selectedEntity}</h2>
            <div className="flex items-center gap-2 text-[10px] opacity-40 font-mono italic">
               <span>Endpoint Base:</span>
               <span className="text-orange-500/80">/api/admin/{selectedEntity}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
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

          {/* QUICK OVERVIEW DATA TABLE */}
          <div className="mt-12 group border-2 border-white/5 rounded-sm overflow-hidden bg-black/20">
            <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/10 leading-none">
                <span className="font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                   Quick View: {selectedEntity}
                </span>
                <span className="text-[9px] opacity-30 font-mono italic">Results from 'LIST ALL' execution</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/50">ID</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/50">Preview Data</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(globalData || []).map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group/row">
                      <td className="p-4 font-mono text-[11px] text-orange-500/70 font-bold">#{item.id}</td>
                      <td className="p-4">
                         <div className="text-[10px] text-white/50 font-mono truncate max-w-md italic">
                            {JSON.stringify(item).substring(0, 80)}...
                         </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteQuick(item.id)}
                          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded transition-all duration-300 opacity-0 group-hover/row:opacity-100 border border-red-500/20"
                          title="Quick Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(globalData && globalData.length === 0) && (
                    <tr><td colSpan="3" className="p-10 text-center text-white/20 italic text-xs tracking-widest uppercase">Select an operation above and click EXECUTE to browse data</td></tr>
                  )}
                  {globalData === null && (
                    <tr><td colSpan="3" className="p-10 text-center text-white/10 italic text-xs tracking-widest uppercase">System ready. Establish connection with API...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
