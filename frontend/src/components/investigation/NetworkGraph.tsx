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
  } = useInvestigation();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

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
        stroke: 'stroke-white',
        strokeWidth: 3,
        glow: 'drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]',
        text: 'fill-cyan-200',
      };
    }
    if (isSelected) {
      return {
        bg: 'fill-amber-500',
        stroke: 'stroke-amber-200',
        strokeWidth: 3,
        glow: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]',
        text: 'fill-amber-200',
      };
    }
    switch (type) {
      case 'PERSON':
        return {
          bg: 'fill-cyan-950/90',
          stroke: 'stroke-cyan-400',
          strokeWidth: 1.8,
          glow: 'drop-shadow-[0_0_6px_rgba(6,182,212,0.3)]',
          text: 'fill-slate-200',
        };
      case 'ACCOUNT':
        return {
          bg: 'fill-emerald-950/90',
          stroke: 'stroke-emerald-400',
          strokeWidth: 2,
          glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]',
          text: 'fill-emerald-200',
        };
      case 'LOCATION':
        return {
          bg: 'fill-amber-950/90',
          stroke: 'stroke-amber-400',
          strokeWidth: 1.8,
          glow: 'drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]',
          text: 'fill-amber-200',
        };
      case 'PHONE':
        return {
          bg: 'fill-indigo-950/90',
          stroke: 'stroke-indigo-400',
          strokeWidth: 1.5,
          glow: 'drop-shadow-[0_0_4px_rgba(99,102,241,0.3)]',
          text: 'fill-slate-300',
        };
      case 'ORGANIZATION':
        return {
          bg: 'fill-purple-950/90',
          stroke: 'stroke-purple-400',
          strokeWidth: 1.8,
          glow: 'drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]',
          text: 'fill-purple-200',
        };
      default:
        return {
          bg: 'fill-slate-900',
          stroke: 'stroke-slate-500',
          strokeWidth: 1.5,
          glow: '',
          text: 'fill-slate-300',
        };
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col select-none">
      {/* Graph Toolbar Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-2 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1.5 rounded-xl shadow-lg">
        <div className="flex items-center space-x-1 border-r border-slate-800 pr-2 mr-1">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-slate-400">View:</span>
          <button
            onClick={() => setGraphFilter('CORE_NEXUS')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              graphFilter === 'CORE_NEXUS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Core Nexus (P-001 ↔ A-001 ↔ P-004)
          </button>
          <button
            onClick={() => setGraphFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              graphFilter === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All 37 Nodes
          </button>
          <button
            onClick={() => setGraphFilter('FINANCIAL')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              graphFilter === 'FINANCIAL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Financial Bridge
          </button>
        </div>

        {/* Zoom & Pan Buttons */}
        <button
          onClick={() => handleZoom(0.15)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Graph Legend & Caption */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end space-y-1.5 pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg text-[10px] flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 font-mono pointer-events-auto">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>PERSON</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded bg-emerald-400" />
            <span>ACCOUNT</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded bg-amber-400" />
            <span>LOCATION</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded bg-indigo-400" />
            <span>PHONE</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded bg-rose-400" />
            <span>VEHICLE</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded bg-purple-400" />
            <span>ORGANIZATION</span>
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2.5 py-0.5 rounded-md border border-slate-800/80">
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
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="22"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="9"
            markerHeight="7"
            refX="24"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 9 3.5, 0 7" fill="#06b6d4" />
          </marker>
          <marker
            id="arrowhead-selected"
            markerWidth="9"
            markerHeight="7"
            refX="24"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 9 3.5, 0 7" fill="#f59e0b" />
          </marker>
        </defs>

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

            // Compute curve midpoint
            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            let strokeColor = '#334155';
            let marker = 'url(#arrowhead)';
            let strokeWidth = 1.5;
            let opacity = selectedEntityId && !isConnectedToSelectedNode ? 0.25 : 1;

            if (isDirectlySelected) {
              strokeColor = '#f59e0b';
              marker = 'url(#arrowhead-selected)';
              strokeWidth = 3;
              opacity = 1;
            } else if (isTimelineActive) {
              strokeColor = '#06b6d4';
              marker = 'url(#arrowhead-active)';
              strokeWidth = 2.5;
              opacity = 1;
            } else if (isConnectedToSelectedNode) {
              strokeColor = '#38bdf8';
              strokeWidth = 2.2;
              opacity = 1;
            } else if (edge.relationship_type === 'ASSOCIATED_WITH') {
              strokeColor = '#0284c7';
              strokeWidth = 1.8;
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
                  strokeWidth="20"
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
                  className="transition-all duration-300 group-hover:stroke-cyan-400 group-hover:stroke-[2.5]"
                />

                {/* Relationship Type Pill Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-42"
                    y="-9"
                    width="84"
                    height="18"
                    rx="9"
                    className={`transition-all ${
                      isDirectlySelected
                        ? 'fill-amber-950 stroke-amber-400'
                        : isTimelineActive
                        ? 'fill-cyan-950 stroke-cyan-400'
                        : isConnectedToSelectedNode
                        ? 'fill-slate-900 stroke-sky-400'
                        : 'fill-slate-900/90 stroke-slate-700/80 group-hover:stroke-cyan-500'
                    }`}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    className={`text-[8.5px] font-mono tracking-tighter ${
                      isDirectlySelected
                        ? 'fill-amber-300 font-bold'
                        : isTimelineActive
                        ? 'fill-cyan-300 font-bold'
                        : isConnectedToSelectedNode
                        ? 'fill-sky-200 font-semibold'
                        : 'fill-slate-400 group-hover:fill-cyan-200'
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
            const radius = isSpecialNexus ? 22 : 18;

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
                    r={radius + 6}
                    className="fill-none stroke-cyan-500/20 animate-pulse"
                    strokeWidth="1"
                  />
                )}

                {/* Main Node Body */}
                <circle
                  r={radius}
                  className={`${colors.bg} ${colors.stroke} ${colors.glow} transition-all duration-300 group-hover:scale-110`}
                  strokeWidth={colors.strokeWidth}
                />

                {/* Node ID Badge / Icon */}
                <g transform="translate(-6, -6)" pointerEvents="none">
                  <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                </g>

                {/* Entity Label & Code */}
                <text
                  y={radius + 14}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold tracking-tight ${colors.text} filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}
                >
                  {node.label}
                </text>
                <text
                  y={radius + 25}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-400 tracking-wider"
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
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl p-3 rounded-xl shadow-2xl max-w-xs text-xs">
          <div className="flex items-center justify-between space-x-2 mb-1">
            <span className="font-bold text-white text-xs truncate">{hoveredNode.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono">
              {hoveredNode.entity_type}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mb-1.5">ID: {hoveredNode.id}</div>
          {hoveredNode.description && (
            <p className="text-[11px] text-slate-300 leading-relaxed">{hoveredNode.description}</p>
          )}
          {hoveredNode.case_role && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-cyan-400 font-mono">
              Role: {hoveredNode.case_role}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
