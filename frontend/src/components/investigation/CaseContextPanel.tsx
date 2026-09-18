import React, { useState, useMemo } from 'react';
import {
  Search,
  FolderOpen,
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export const CaseContextPanel: React.FC = () => {
  const {
    activeCase,
    network,
    timeline,
    selectedEntityId,
    selectEntity,
    searchQuery,
    setSearchQuery,
  } = useInvestigation();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const nodes = network?.nodes || [];

  // Filtered entity list
  const filteredEntities = useMemo(() => {
    return nodes.filter((n) => {
      const matchesType = typeFilter === 'ALL' || n.entity_type === typeFilter;
      const matchesSearch =
        !searchQuery ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.entity_type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [nodes, typeFilter, searchQuery]);

  const typePills = ['ALL', 'PERSON', 'ACCOUNT', 'LOCATION', 'PHONE', 'ORGANIZATION', 'VEHICLE'];

  return (
    <div className="w-80 bg-white dark:bg-slate-900/70 border-r border-slate-200 dark:border-slate-800/80 flex flex-col h-full flex-shrink-0 backdrop-blur-md transition-colors select-none">
      {/* 1. Case Dossier Summary Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider flex items-center space-x-1">
            <FolderOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>INVESTIGATION DOSSIER</span>
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-mono font-bold shadow-sm">
            {activeCase?.status || 'ACTIVE'}
          </span>
        </div>

        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
          {activeCase?.title || 'Operation Meridian'}
        </h2>
        <div className="flex items-center space-x-2 text-[11px] text-cyan-700 dark:text-cyan-400 font-mono font-semibold mt-0.5">
          <span>{activeCase?.id || 'CASE-001'}</span>
          <span>•</span>
          <span>{activeCase?.case_number || 'NH-2026-001'}</span>
        </div>

        {/* Metric Badges Grid (White boxes with silver borders in Light Mode) */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/60 text-center font-mono">
          <div className="bg-slate-50 dark:bg-slate-950/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-400">{network?.total_nodes || 37}</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">Entities</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{network?.total_edges || 38}</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">Rels</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400">25</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">Evidence</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-purple-700 dark:text-purple-400">{timeline.length || 22}</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">Events</div>
          </div>
        </div>
      </div>

      {/* 2. Entity Filter & Search */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 space-y-2 bg-slate-50/30 dark:bg-slate-950/20">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities &amp; targets..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-lg pl-8 pr-2.5 py-1.5 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
          />
        </div>

        {/* Quick Type Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 text-[10px] font-mono no-scrollbar">
          {typePills.map((p) => (
            <button
              key={p}
              onClick={() => setTypeFilter(p)}
              className={`px-2 py-0.5 rounded-lg transition-all whitespace-nowrap shadow-sm ${
                typeFilter === p
                  ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Entity Roster List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 py-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold tracking-wider flex items-center justify-between">
          <span>ENTITIES ({filteredEntities.length})</span>
          <span>CLICK TO FOCUS</span>
        </div>

        {filteredEntities.map((ent) => {
          const isSelected = selectedEntityId === ent.id;
          const isPrimary = ['P-001', 'P-004', 'A-001', 'L-001'].includes(ent.id);

          return (
            <div
              key={ent.id}
              onClick={() => selectEntity(ent.id)}
              className={`p-2.5 rounded-xl cursor-pointer transition-all border shadow-sm ${
                isSelected
                  ? 'bg-cyan-50 dark:bg-cyan-500/15 border-cyan-300 dark:border-cyan-500/50'
                  : isPrimary
                  ? 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'bg-white/60 dark:bg-slate-950/30 border-slate-100 dark:border-slate-900 hover:bg-white dark:hover:bg-slate-950/60 hover:border-slate-200 dark:hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-xs font-bold ${isSelected ? 'text-cyan-800 dark:text-cyan-300' : 'text-slate-900 dark:text-slate-200'}`}>
                  {ent.label}
                </span>
                <span className="text-[9px] px-2 py-0.2 rounded-full font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-400">
                  {ent.entity_type}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span className="font-semibold">{ent.id}</span>
                {ent.case_role && (
                  <span className="text-slate-500 dark:text-slate-400">{ent.case_role}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
