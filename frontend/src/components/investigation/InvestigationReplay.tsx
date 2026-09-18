import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  MapPin,
  Users,
  Calendar,
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export const InvestigationReplay: React.FC = () => {
  const {
    timeline,
    timelineIndex,
    setTimelineIndex,
    isPlayingTimeline,
    toggleTimelinePlay,
    selectEntity,
    selectRelationship,
  } = useInvestigation();

  if (!timeline || timeline.length === 0) {
    return (
      <div className="h-32 bg-slate-900/90 border-t border-slate-800/80 p-4 flex items-center justify-center text-xs text-slate-500 font-mono">
        No chronological events recorded for this case.
      </div>
    );
  }

  const currentEvent = timeline[timelineIndex] || timeline[0];

  // 4 Key Milestones requested for jury demonstration
  const milestones = [
    {
      label: 'JAN 10',
      type: 'CALL',
      desc: 'Marcus Vance → Julian Thorne',
      targetIndex: 0,
      focusAction: () => {
        setTimelineIndex(0);
        selectEntity('P-001');
      },
    },
    {
      label: 'JAN 15',
      type: 'MEETING',
      desc: 'Warehouse Dock 9',
      targetIndex: 2,
      focusAction: () => {
        setTimelineIndex(2);
        selectEntity('L-001');
      },
    },
    {
      label: 'JAN 20',
      type: 'TRANSACTION',
      desc: 'Account A-001 ($250,000)',
      targetIndex: 4,
      focusAction: () => {
        setTimelineIndex(4);
        selectEntity('A-001');
        selectRelationship('REL-001');
      },
    },
    {
      label: 'FEB–MAR',
      type: 'EXPANSION',
      desc: 'Network Expansion',
      targetIndex: 7,
      focusAction: () => {
        setTimelineIndex(Math.min(7, timeline.length - 1));
        selectEntity('P-004');
      },
    },
  ];

  return (
    <div className="bg-slate-900/90 border-t border-slate-800/80 p-3 backdrop-blur-md flex flex-col justify-between flex-shrink-0 z-20 select-none space-y-2.5">
      {/* 1. Header & Timeline Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              TIMELINE REPLAY
            </span>
          </div>

          <div className="text-[10px] font-mono text-cyan-300 px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center space-x-1.5">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>{currentEvent.timestamp}</span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-semibold">
            {currentEvent.event_type}
          </span>

          <span className="hidden md:inline-block text-[10px] font-mono text-slate-500">
            • Network state at selected time
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimelineIndex(Math.max(0, timelineIndex - 1))}
            disabled={timelineIndex === 0}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors"
            title="Previous Event"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleTimelinePlay}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            {isPlayingTimeline ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY TIMELINE</span>
              </>
            )}
          </button>

          <button
            onClick={() => setTimelineIndex(Math.min(timeline.length - 1, timelineIndex + 1))}
            disabled={timelineIndex === timeline.length - 1}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors"
            title="Next Event"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-mono text-slate-400 ml-1">
            {timelineIndex + 1}/{timeline.length}
          </span>
        </div>
      </div>

      {/* 2. Four Major Milestones Shortcuts for Jury Demo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
        {milestones.map((m, idx) => {
          const isCurrent = timelineIndex === m.targetIndex;
          return (
            <button
              key={idx}
              onClick={m.focusAction}
              className={`p-1.5 rounded-lg border text-left transition-all font-mono ${
                isCurrent
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-[9px]">
                <span className="font-bold text-cyan-400">{m.label}</span>
                <span className="text-slate-500">{m.type}</span>
              </div>
              <div className="text-[10px] truncate text-slate-300 font-sans mt-0.5">
                {m.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Timeline Step Slider Track */}
      <div className="relative flex items-center">
        <input
          type="range"
          min="0"
          max={timeline.length - 1}
          value={timelineIndex}
          onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
      </div>

      {/* 4. Active Event Detail Banner */}
      <div className="flex items-center justify-between bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2 truncate">
          <span className="font-mono text-cyan-400 text-[10px] font-bold">[{currentEvent.id}]</span>
          <p className="text-slate-200 truncate text-[11px] leading-tight">
            {currentEvent.description}
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0 ml-3 font-mono text-[9px] text-slate-400">
          {currentEvent.location_name && (
            <div className="flex items-center space-x-1 text-amber-400">
              <MapPin className="w-3 h-3" />
              <span>{currentEvent.location_name}</span>
            </div>
          )}

          {currentEvent.entities && currentEvent.entities.length > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-cyan-400" />
              <div className="flex items-center space-x-1">
                {currentEvent.entities.map((p) => (
                  <button
                    key={p.entity_id}
                    onClick={() => selectEntity(p.entity_id)}
                    className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
