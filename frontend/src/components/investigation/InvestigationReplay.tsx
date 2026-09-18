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
      <div className="h-32 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800/80 p-4 flex items-center justify-center text-xs text-slate-500 font-mono">
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
    <div className="bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800/80 p-3.5 backdrop-blur-md flex flex-col justify-between flex-shrink-0 z-20 select-none space-y-3 transition-colors shadow-sm">
      {/* 1. Header & Timeline Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              TIMELINE REPLAY
            </span>
          </div>

          <div className="text-[10px] font-mono text-cyan-800 dark:text-cyan-300 px-2.5 py-0.5 rounded-md bg-cyan-50 dark:bg-slate-950 border border-cyan-200 dark:border-slate-800 flex items-center space-x-1.5 font-bold shadow-sm">
            <Calendar className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>{currentEvent.timestamp}</span>
          </div>

          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-mono font-bold shadow-sm">
            {currentEvent.event_type}
          </span>

          <span className="hidden md:inline-block text-[10px] font-mono text-slate-500 font-medium">
            • Network state at selected time
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimelineIndex(Math.max(0, timelineIndex - 1))}
            disabled={timelineIndex === 0}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors shadow-sm"
            title="Previous Event"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleTimelinePlay}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-md font-mono"
          >
            {isPlayingTimeline ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY REPLAY</span>
              </>
            )}
          </button>

          <button
            onClick={() => setTimelineIndex(Math.min(timeline.length - 1, timelineIndex + 1))}
            disabled={timelineIndex === timeline.length - 1}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors shadow-sm"
            title="Next Event"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 ml-1 font-bold">
            {timelineIndex + 1}/{timeline.length}
          </span>
        </div>
      </div>

      {/* 2. Four Major Milestones Shortcuts for Jury Demo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {milestones.map((m, idx) => {
          const isCurrent = timelineIndex === m.targetIndex;
          return (
            <button
              key={idx}
              onClick={m.focusAction}
              className={`p-2.5 rounded-xl border text-left transition-all font-mono shadow-sm ${
                isCurrent
                  ? 'bg-cyan-50 dark:bg-cyan-950/80 border-cyan-300 dark:border-cyan-400 text-cyan-900 dark:text-cyan-200 shadow-sm'
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-950/60 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-cyan-700 dark:text-cyan-400">{m.label}</span>
                <span className="text-slate-400 dark:text-slate-500 font-semibold">{m.type}</span>
              </div>
              <div className="text-xs truncate text-slate-900 dark:text-slate-200 font-sans font-medium mt-0.5">
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
          className="w-full h-2 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400 focus:outline-none"
        />
      </div>

      {/* 4. Active Event Detail Banner */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
        <div className="flex items-center space-x-2.5 truncate">
          <span className="font-mono text-cyan-700 dark:text-cyan-400 text-[11px] font-bold">[{currentEvent.id}]</span>
          <p className="text-slate-800 dark:text-slate-200 truncate text-xs font-sans leading-tight">
            {currentEvent.description}
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0 ml-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">
          {currentEvent.location_name && (
            <div className="flex items-center space-x-1 text-amber-700 dark:text-amber-400 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{currentEvent.location_name}</span>
            </div>
          )}

          {currentEvent.entities && currentEvent.entities.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <div className="flex items-center space-x-1">
                {currentEvent.entities.map((p) => (
                  <button
                    key={p.entity_id}
                    onClick={() => selectEntity(p.entity_id)}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 hover:border-cyan-300 dark:hover:border-cyan-500 transition-colors shadow-sm font-semibold"
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
