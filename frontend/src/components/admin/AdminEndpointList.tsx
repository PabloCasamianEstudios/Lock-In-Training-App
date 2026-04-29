import { FC } from 'react';
import { SwaggerBlock } from './SwaggerBlock';

interface AdminEndpointListProps {
  selectedEntity: string;
  setGlobalData: (data: any[]) => void;
}

export const AdminEndpointList: FC<AdminEndpointListProps> = ({ selectedEntity, setGlobalData }) => {
  return (
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
  );
};
