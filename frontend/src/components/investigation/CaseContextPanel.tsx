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
    <div className="w-80 bg-slate-900/70 border-r border-slate-800/80 flex flex-col h-full flex-shrink-0 backdrop-blur-md">
      {/* 1. Case Dossier Summary Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center space-x-1">
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>INVESTIGATION DOSSIER</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
            {activeCase?.status || 'ACTIVE'}
          </span>
        </div>

        <h2 className="text-sm font-bold text-white tracking-tight truncate">
          {activeCase?.title || 'Operation Meridian'}
        </h2>
        <div className="flex items-center space-x-2 text-[11px] text-cyan-400 font-mono mt-0.5">
          <span>{activeCase?.id || 'CASE-001'}</span>
          <span>•</span>
          <span>{activeCase?.case_number || 'NH-2026-001'}</span>
        </div>

        {/* Metric Badges Grid */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-800/60 text-center font-mono">
          <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
            <div className="text-xs font-bold text-cyan-400">{network?.total_nodes || 37}</div>
            <div className="text-[9px] text-slate-400">Entities</div>
          </div>
          <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
            <div className="text-xs font-bold text-emerald-400">{network?.total_edges || 38}</div>
            <div className="text-[9px] text-slate-400">Rels</div>
          </div>
          <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
            <div className="text-xs font-bold text-amber-400">25</div>
            <div className="text-[9px] text-slate-400">Evidence</div>
          </div>
          <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
            <div className="text-xs font-bold text-purple-400">{timeline.length || 22}</div>
            <div className="text-[9px] text-slate-400">Events</div>
          </div>
        </div>
      </div>

      {/* 2. Entity Filter & Search */}
      <div className="p-3 border-b border-slate-800/80 space-y-2 bg-slate-950/20">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities &amp; targets..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-2.5 py-1.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Quick Type Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 text-[10px] font-mono no-scrollbar">
          {typePills.map((p) => (
            <button
              key={p}
              onClick={() => setTypeFilter(p)}
              className={`px-2 py-0.5 rounded transition-all whitespace-nowrap ${
                typeFilter === p
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Entity Roster List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 py-1 text-[10px] font-mono text-slate-500 font-semibold tracking-wider flex items-center justify-between">
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
              className={`p-2 rounded-lg cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/50 shadow-sm'
                  : isPrimary
                  ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/30 border-transparent hover:bg-slate-950/60 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {ent.label}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-900 border border-slate-800 text-cyan-400">
                  {ent.entity_type}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{ent.id}</span>
                {ent.case_role && (
                  <span className="text-slate-400">{ent.case_role}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
