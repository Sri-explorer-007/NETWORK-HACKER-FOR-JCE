import React, { useState, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  User,
  CreditCard,
  MapPin,
  Phone,
  Building2,
  Car,
  Laptop,
  Filter,
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';
import { GraphNode } from '../../types/investigation';

export const NetworkGraph: React.FC = () => {
  const {
    network,
    selectedEntityId,
    selectedRelationshipId,
    selectEntity,
    selectRelationship,
    timeline,
    timelineIndex,
    graphFilter,
    setGraphFilter,
    theme,
  } = useInvestigation();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const isLight = theme !== 'dark';

  // Active event participants from timeline
  const activeEvent = timeline[timelineIndex];
  const activeEntityIds = useMemo(() => {
    if (!activeEvent) return new Set<string>();
    const set = new Set<string>();
    activeEvent.entities?.forEach((e) => set.add(e.entity_id));
    if (activeEvent.location_id) set.add(activeEvent.location_id);
    return set;
  }, [activeEvent]);

  // Primary Layout positions for the core investigation nexus
  const layoutPositions: Record<string, { x: number; y: number }> = {
    // Core Nexus (Focal path)
    'P-001': { x: 250, y: 280 }, // Marcus Vance
    'A-001': { x: 500, y: 280 }, // Account A-001 (Shared)
    'P-004': { x: 750, y: 280 }, // Julian Thorne
    'L-001': { x: 500, y: 130 }, // Warehouse Dock 9
    'P-002': { x: 200, y: 440 }, // David Vance (Associate)
    'PH-001': { x: 120, y: 240 }, // Primary Phone
    'PH-002': { x: 360, y: 170 }, // Burner Phone PH-002
    'V-001': { x: 380, y: 430 }, // Sedan V-001
    'V-002': { x: 860, y: 390 }, // Vehicle V-002
    'O-001': { x: 140, y: 370 }, // Meridian Logistics
    'P-003': { x: 880, y: 180 }, // Elena Rostova
    'A-002': { x: 620, y: 440 }, // Secondary Account
    'A-003': { x: 720, y: 140 }, // Escrow Account
    'P-009': { x: 420, y: 70 },  // Viktor Ramos
    'P-005': { x: 620, y: 70 },  // Gabriel Silva
    'P-011': { x: 120, y: 500 }, // David Vance (Engineer duplicate)
  };

  // Assign deterministic circular positions for any peripheral nodes
  const nodes = network?.nodes || [];
  const edges = network?.edges || [];

  const computedNodes = useMemo(() => {
    let angle = 0;
    const count = nodes.length;
    return nodes.map((node) => {
      if (layoutPositions[node.id]) {
        return { ...node, x: layoutPositions[node.id].x, y: layoutPositions[node.id].y };
      }
      // Peripheral placement
      const rad = (angle * Math.PI) / 180;
      angle += 360 / Math.max(1, count - Object.keys(layoutPositions).length);
      return {
        ...node,
        x: 500 + Math.cos(rad) * 360,
        y: 280 + Math.sin(rad) * 230,
      };
    });
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof computedNodes[0]>();
    computedNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [computedNodes]);

  // Filter nodes based on graphFilter view
  const visibleNodes = useMemo(() => {
    if (graphFilter === 'CORE_NEXUS') {
      const coreIds = new Set([
        'P-001', 'A-001', 'P-004', 'L-001', 'P-002', 'PH-002', 'V-001', 'O-001', 'P-003', 'A-003'
      ]);
      return computedNodes.filter((n) => coreIds.has(n.id));
    }
    if (graphFilter === 'FINANCIAL') {
      const finTypes = new Set(['ACCOUNT', 'PERSON', 'ORGANIZATION']);
      return computedNodes.filter((n) => finTypes.has(n.entity_type));
    }
    return computedNodes;
  }, [computedNodes, graphFilter]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [edges, visibleNodeIds]);

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(0.4, prev + delta), 2.5));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'PERSON': return User;
      case 'ACCOUNT': return CreditCard;
      case 'LOCATION': return MapPin;
      case 'PHONE': return Phone;
      case 'ORGANIZATION': return Building2;
      case 'VEHICLE': return Car;
      default: return Laptop;
    }
  };

  const getNodeColors = (type: string, isSelected: boolean, isTimelineActive: boolean) => {
    if (isTimelineActive) {
      return {
        bg: 'fill-cyan-500',
        stroke: 'stroke-cyan-700 dark:stroke-white',
        strokeWidth: 3,
        glow: 'drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]',
        text: isLight ? 'fill-cyan-900' : 'fill-cyan-200',
        icon: 'text-white',
      };
    }
    if (isSelected) {
      return {
        bg: 'fill-amber-500',
        stroke: 'stroke-amber-700 dark:stroke-amber-200',
        strokeWidth: 3,
        glow: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]',
        text: isLight ? 'fill-amber-900' : 'fill-amber-200',
        icon: 'text-white',
      };
    }

    if (isLight) {
      // Crisp Light Mode Palette (White card pills with clean colored borders)
      switch (type) {
        case 'PERSON':
          return {
            bg: 'fill-cyan-50',
            stroke: 'stroke-cyan-600',
            strokeWidth: 2,
            glow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]',
            text: 'fill-slate-900',
            icon: 'text-cyan-700',
          };
        case 'ACCOUNT':
          return {
            bg: 'fill-emerald-50',
            stroke: 'stroke-emerald-600',
            strokeWidth: 2.2,
            glow: 'drop-shadow-[0_2px_6px_rgba(16,185,129,0.2)]',
            text: 'fill-slate-900',
            icon: 'text-emerald-700',
          };
        case 'LOCATION':
          return {
            bg: 'fill-amber-50',
            stroke: 'stroke-amber-600',
            strokeWidth: 2,
            glow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]',
            text: 'fill-slate-900',
            icon: 'text-amber-700',
          };
        case 'PHONE':
          return {
            bg: 'fill-indigo-50',
            stroke: 'stroke-indigo-600',
            strokeWidth: 1.8,
            glow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]',
            text: 'fill-slate-900',
            icon: 'text-indigo-700',
          };
        case 'ORGANIZATION':
          return {
            bg: 'fill-purple-50',
            stroke: 'stroke-purple-600',
            strokeWidth: 2,
            glow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]',
            text: 'fill-slate-900',
            icon: 'text-purple-700',
          };
        default:
          return {
            bg: 'fill-slate-100',
            stroke: 'stroke-slate-400',
            strokeWidth: 1.5,
            glow: 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
            text: 'fill-slate-900',
            icon: 'text-slate-700',
          };
      }
    }

    // Dark Mode Palette
    switch (type) {
      case 'PERSON':
        return {
          bg: 'fill-cyan-950/90',
          stroke: 'stroke-cyan-400',
          strokeWidth: 1.8,
          glow: 'drop-shadow-[0_0_6px_rgba(6,182,212,0.3)]',
          text: 'fill-slate-200',
          icon: 'text-cyan-400',
        };
      case 'ACCOUNT':
        return {
          bg: 'fill-emerald-950/90',
          stroke: 'stroke-emerald-400',
          strokeWidth: 2,
          glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]',
          text: 'fill-emerald-200',
          icon: 'text-emerald-400',
        };
      case 'LOCATION':
        return {
          bg: 'fill-amber-950/90',
          stroke: 'stroke-amber-400',
          strokeWidth: 1.8,
          glow: 'drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]',
          text: 'fill-amber-200',
          icon: 'text-amber-400',
        };
      case 'PHONE':
        return {
          bg: 'fill-indigo-950/90',
          stroke: 'stroke-indigo-400',
          strokeWidth: 1.5,
          glow: 'drop-shadow-[0_0_4px_rgba(99,102,241,0.3)]',
          text: 'fill-slate-300',
          icon: 'text-indigo-400',
        };
      case 'ORGANIZATION':
        return {
          bg: 'fill-purple-950/90',
          stroke: 'stroke-purple-400',
          strokeWidth: 1.8,
          glow: 'drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]',
          text: 'fill-purple-200',
          icon: 'text-purple-400',
        };
      default:
        return {
          bg: 'fill-slate-900',
          stroke: 'stroke-slate-500',
          strokeWidth: 1.5,
          glow: '',
          text: 'fill-slate-300',
          icon: 'text-slate-400',
        };
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-100/70 dark:bg-slate-950 overflow-hidden flex flex-col select-none transition-colors">
      {/* Graph Toolbar Controls */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex items-center space-x-1 sm:space-x-2 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md p-1 sm:p-1.5 rounded-xl shadow-md transition-colors max-w-[calc(100%-1rem)] overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 border-r border-slate-200 dark:border-slate-800 pr-1.5 sm:pr-2 mr-0.5 sm:mr-1">
          <Filter className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
          <button
            onClick={() => setGraphFilter('CORE_NEXUS')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
              graphFilter === 'CORE_NEXUS'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Core Nexus (P-001 ↔ A-001 ↔ P-004)</span>
            <span className="sm:hidden">Nexus</span>
          </button>
          <button
            onClick={() => setGraphFilter('ALL')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
              graphFilter === 'ALL'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">All 37 Nodes</span>
            <span className="sm:hidden">All</span>
          </button>
          <button
            onClick={() => setGraphFilter('FINANCIAL')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
              graphFilter === 'FINANCIAL'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Financial Bridge</span>
            <span className="sm:hidden">Finance</span>
          </button>
        </div>

        {/* Zoom & Pan Buttons */}
        <button
          onClick={() => handleZoom(0.15)}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Graph Legend & Caption */}
      <div className="hidden sm:flex absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex-col items-end space-y-1.5 pointer-events-none">
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-md text-[9px] sm:text-[10px] flex flex-wrap items-center gap-x-2.5 sm:gap-x-3.5 gap-y-1 text-slate-700 dark:text-slate-300 font-mono pointer-events-auto transition-colors">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-cyan-500 shadow-sm" />
            <span className="font-semibold">PERSON</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded bg-emerald-500 shadow-sm" />
            <span className="font-semibold">ACCOUNT</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded bg-amber-500 shadow-sm" />
            <span className="font-semibold">LOCATION</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded bg-indigo-500 shadow-sm" />
            <span className="font-semibold">PHONE</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded bg-rose-500 shadow-sm" />
            <span className="font-semibold">VEHICLE</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded bg-purple-500 shadow-sm" />
            <span className="font-semibold">ORGANIZATION</span>
          </span>
        </div>
        <div className="text-[9px] sm:text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-950/80 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          Recorded relationships from retrieved investigation data
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        id="graph-bg"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" className="fill-slate-300 dark:fill-slate-800" />
          </pattern>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="22"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill={isLight ? '#64748b' : '#64748b'} />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="9"
            markerHeight="7"
            refX="24"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 9 3.5, 0 7" fill="#0284c7" />
          </marker>
          <marker
            id="arrowhead-selected"
            markerWidth="9"
            markerHeight="7"
            refX="24"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 9 3.5, 0 7" fill="#d97706" />
          </marker>
        </defs>

        <rect width="100%" height="100%" fill="url(#graph-grid)" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. Render Edges (Relationships) */}
          {visibleEdges.map((edge) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;

            const isDirectlySelected = selectedRelationshipId === edge.id;
            const isConnectedToSelectedNode =
              selectedEntityId === edge.source || selectedEntityId === edge.target;
            const isTimelineActive =
              activeEntityIds.has(edge.source) && activeEntityIds.has(edge.target);

            // Compute midpoint
            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            let strokeColor = isLight ? '#94a3b8' : '#334155';
            let marker = 'url(#arrowhead)';
            let strokeWidth = 1.6;
            let opacity = selectedEntityId && !isConnectedToSelectedNode ? 0.25 : 1;

            if (isDirectlySelected) {
              strokeColor = '#d97706';
              marker = 'url(#arrowhead-selected)';
              strokeWidth = 3.2;
              opacity = 1;
            } else if (isTimelineActive) {
              strokeColor = '#0284c7';
              marker = 'url(#arrowhead-active)';
              strokeWidth = 2.8;
              opacity = 1;
            } else if (isConnectedToSelectedNode) {
              strokeColor = '#0ea5e9';
              strokeWidth = 2.4;
              opacity = 1;
            } else if (edge.relationship_type === 'ASSOCIATED_WITH') {
              strokeColor = isLight ? '#0284c7' : '#0284c7';
              strokeWidth = 2;
            }

            return (
              <g
                key={edge.id}
                className="cursor-pointer group"
                style={{ opacity }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectRelationship(edge.id);
                }}
              >
                {/* Clickable transparent thick line */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="transparent"
                  strokeWidth="24"
                />
                {/* Visible rendered line */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={edge.status === 'UNVERIFIED' ? '4,4' : undefined}
                  markerEnd={marker}
                  className="transition-all duration-300 group-hover:stroke-cyan-500 group-hover:stroke-[2.8]"
                />

                {/* Relationship Type Pill Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-44"
                    y="-10"
                    width="88"
                    height="20"
                    rx="10"
                    className={`transition-all shadow-sm ${
                      isDirectlySelected
                        ? 'fill-amber-100 stroke-amber-500 dark:fill-amber-950 dark:stroke-amber-400'
                        : isTimelineActive
                        ? 'fill-cyan-100 stroke-cyan-500 dark:fill-cyan-950 dark:stroke-cyan-400'
                        : isConnectedToSelectedNode
                        ? 'fill-sky-100 stroke-sky-500 dark:fill-slate-900 dark:stroke-sky-400'
                        : 'fill-white stroke-slate-300 dark:fill-slate-900/90 dark:stroke-slate-700/80 group-hover:stroke-cyan-500'
                    }`}
                    strokeWidth="1.2"
                  />
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    className={`text-[9px] font-mono tracking-tighter ${
                      isDirectlySelected
                        ? 'fill-amber-900 dark:fill-amber-300 font-bold'
                        : isTimelineActive
                        ? 'fill-cyan-900 dark:fill-cyan-300 font-bold'
                        : isConnectedToSelectedNode
                        ? 'fill-sky-900 dark:fill-sky-200 font-bold'
                        : 'fill-slate-700 dark:fill-slate-300 font-semibold group-hover:fill-cyan-700 dark:group-hover:fill-cyan-200'
                    }`}
                  >
                    {edge.relationship_type.replace(/_/g, ' ')}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 2. Render Nodes (Entities) */}
          {visibleNodes.map((node) => {
            const isDirectlySelected = selectedEntityId === node.id;
            const isTimelineActive = activeEntityIds.has(node.id);
            const isConnectedToSelectedRel =
              selectedRelationshipId &&
              visibleEdges.some(
                (e) =>
                  e.id === selectedRelationshipId &&
                  (e.source === node.id || e.target === node.id)
              );
            
            const isHighlight = isDirectlySelected || isConnectedToSelectedRel;
            const colors = getNodeColors(node.entity_type, Boolean(isHighlight), isTimelineActive);
            const Icon = getNodeIcon(node.entity_type);
            const isSpecialNexus = ['P-001', 'A-001', 'P-004', 'L-001'].includes(node.id);
            const radius = isSpecialNexus ? 24 : 19;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  selectEntity(node.id);
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow ring for focal node */}
                {isSpecialNexus && (
                  <circle
                    r={radius + 7}
                    className="fill-none stroke-cyan-500/30 animate-pulse"
                    strokeWidth="1.5"
                  />
                )}

                {/* Main Node Body */}
                <circle
                  r={radius}
                  className={`${colors.bg} ${colors.stroke} ${colors.glow} transition-all duration-300 group-hover:scale-110 shadow-md`}
                  strokeWidth={colors.strokeWidth}
                />

                {/* Node ID Badge / Icon */}
                <g transform="translate(-7, -7)" pointerEvents="none">
                  <Icon className={`w-3.5 h-3.5 ${colors.icon}`} />
                </g>

                {/* Entity Label & Code */}
                <text
                  y={radius + 15}
                  textAnchor="middle"
                  className={`text-xs font-bold tracking-tight ${colors.text} filter ${isLight ? 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]' : 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'}`}
                >
                  {node.label}
                </text>
                <text
                  y={radius + 27}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400 font-semibold tracking-wider"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Node Hover Tooltip Card */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl max-w-xs text-xs transition-colors">
          <div className="flex items-center justify-between space-x-2 mb-1">
            <span className="font-bold text-slate-900 dark:text-white text-xs truncate">{hoveredNode.label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-mono font-bold">
              {hoveredNode.entity_type}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-1.5 font-semibold">ID: {hoveredNode.id}</div>
          {hoveredNode.description && (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{hoveredNode.description}</p>
          )}
          {hoveredNode.case_role && (
            <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[10px] text-cyan-700 dark:text-cyan-400 font-mono font-semibold">
              Role: {hoveredNode.case_role}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
