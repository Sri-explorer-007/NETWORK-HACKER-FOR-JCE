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

  const [zoom, setZoom] = useState<number>(0.95);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 10, y: 15 });
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

  // Clean, high-legibility short labels for nodes to prevent long strings from overlapping
  const getCleanLabel = (node: GraphNode): string => {
    if (node.id === 'P-001') return 'Marcus Vance';
    if (node.id === 'A-001') return 'Chase A-001';
    if (node.id === 'P-004') return 'Julian Thorne';
    if (node.id === 'L-001') return 'Warehouse Dock 9';
    if (node.id === 'PH-002') return 'Burner (+0199)';
    if (node.id === 'PH-001') return 'Office Phone';
    if (node.id === 'V-001') return 'Toyota SUV';
    if (node.id === 'V-002') return 'Mercedes Sedan';
    if (node.id === 'ORG-001' || node.id === 'O-001') return 'Apex Holdings';
    if (node.id === 'ORG-002') return 'Meridian Logistics';
    if (node.id === 'P-002') return 'David Vance';
    if (node.id === 'P-003') return 'Elena Rostova';
    if (node.id === 'A-003') return 'Offshore Escrow';
    if (node.id === 'A-004') return 'Signature Trust';
    if (node.id === 'DEV-001') return 'Encrypted Laptop';
    if (node.id === 'P-009') return "Liam O'Connor";
    if (node.id === 'P-011') return 'David Vance (Boston)';

    if (node.label && node.label.length > 18) return node.label.slice(0, 16) + '...';
    return node.label || node.id;
  };

  const getRoleTag = (node: GraphNode): string => {
    if (node.id === 'P-001') return 'PRIMARY TARGET';
    if (node.id === 'A-001') return 'SHARED NEXUS HUB';
    if (node.id === 'P-004') return 'KEY FACILITATOR';
    if (node.id === 'L-001') return 'MEETING VENUE';
    if (node.id === 'PH-002') return 'BURNER COMMS';
    if (node.id === 'V-001') return 'SURVEILLANCE';
    if (node.id === 'P-002') return 'OPERATIONS MGR';
    if (node.id === 'P-003') return 'FINANCIAL BROKER';
    if (node.id === 'ORG-002') return 'LOGISTICS HUB';
    if (node.id === 'A-003') return 'ESCROW ROUTING';
    return node.entity_type;
  };

  // Clean, high-legibility short labels for edge badges
  const getCleanEdgeLabel = (edge: any): string => {
    if ((edge.source === 'P-001' && edge.target === 'A-001') || (edge.source === 'A-001' && edge.target === 'P-001')) {
      return 'BENEFICIAL OWNER';
    }
    if ((edge.source === 'P-004' && edge.target === 'A-001') || (edge.source === 'A-001' && edge.target === 'P-004')) {
      return 'AUTHORIZED SIGNATORY';
    }
    if ((edge.source === 'P-001' && edge.target === 'PH-002') || (edge.source === 'PH-002' && edge.target === 'P-001')) {
      return 'USED BURNER';
    }
    if ((edge.source === 'P-001' && edge.target === 'L-001') || (edge.source === 'L-001' && edge.target === 'P-001')) {
      return 'MET AT DOCK';
    }
    if ((edge.source === 'P-004' && edge.target === 'L-001') || (edge.source === 'L-001' && edge.target === 'P-004')) {
      return 'MET AT DOCK';
    }
    if ((edge.source === 'P-001' && edge.target === 'P-002') || (edge.source === 'P-002' && edge.target === 'P-001')) {
      return 'BROTHER / OPS';
    }
    if ((edge.source === 'P-001' && edge.target === 'P-004') || (edge.source === 'P-004' && edge.target === 'P-001')) {
      return 'COORDINATED';
    }
    if ((edge.source === 'P-004' && edge.target === 'A-003') || (edge.source === 'A-003' && edge.target === 'P-004')) {
      return 'WIRED $250K';
    }
    if ((edge.source === 'P-001' && edge.target === 'ORG-002') || (edge.source === 'ORG-002' && edge.target === 'P-001')) {
      return 'OWNS 60%';
    }
    if ((edge.source === 'ORG-002' && edge.target === 'V-001') || (edge.source === 'V-001' && edge.target === 'ORG-002')) {
      return 'FLEET VEHICLE';
    }
    return edge.relationship_type.replace(/_/g, ' ');
  };

  // Spacious, non-overlapping 3-Tier Layout
  // Row 1 (Top Y = 100): Communications & Locations & Offshore
  // Row 2 (Center Y = 280): Core Nexus Investigation Path (Marcus -> Account A-001 -> Julian)
  // Row 3 (Bottom Y = 460): Associates, Organizations, Fleet & Secondary Accounts
  const layoutPositions: Record<string, { x: number; y: number }> = {
    // 1. CENTER PRIMARY NEXUS (Horizontal High-Impact Path)
    'P-001': { x: 240, y: 280 }, // Marcus Vance (Primary Target)
    'A-001': { x: 550, y: 280 }, // Account A-001 (Shared Nexus Hub)
    'P-004': { x: 860, y: 280 }, // Julian Thorne (Key Facilitator)

    // 2. TOP ROW (Spaced out along upper perimeter)
    'PH-002': { x: 130, y: 110 }, // Burner Phone (+1-555-0199) - Upper Far Left
    'PH-001': { x: 290, y: 110 }, // Primary Phone - Upper Left
    'P-009': { x: 420, y: 110 },  // Liam O'Connor (Dock Supervisor)
    'L-001': { x: 550, y: 100 },  // Warehouse Dock 9 - Upper Center
    'DEV-001': { x: 700, y: 110 }, // Encrypted Laptop
    'ORG-001': { x: 840, y: 110 }, // Apex Holdings - Upper Right
    'A-003': { x: 980, y: 110 },  // Offshore Escrow A-003 - Upper Far Right

    // 3. BOTTOM ROW (Spaced out along lower perimeter)
    'P-002': { x: 130, y: 460 },  // David Vance (Operations Manager)
    'ORG-002': { x: 310, y: 460 }, // Meridian Logistics LLC
    'V-001': { x: 450, y: 460 },  // Black Toyota SUV
    'A-004': { x: 590, y: 460 },  // Signature Trust Account
    'V-002': { x: 730, y: 460 },  // Mercedes S-Class
    'P-003': { x: 870, y: 460 },  // Elena Rostova (Financial Broker)
    'A-002': { x: 990, y: 460 },  // Offshore HSBC Account

    // 4. Peripherals
    'P-011': { x: 30, y: 280 },   // David Vance (Boston Engineer - Duplicate)
  };

  const nodes = network?.nodes || [];
  const edges = network?.edges || [];

  const computedNodes = useMemo(() => {
    let angle = 0;
    const count = nodes.length;
    return nodes.map((node) => {
      if (layoutPositions[node.id]) {
        return { ...node, x: layoutPositions[node.id].x, y: layoutPositions[node.id].y };
      }
      // Clean peripheral circular placement for any extra nodes
      const rad = (angle * Math.PI) / 180;
      angle += 360 / Math.max(1, count - Object.keys(layoutPositions).length);
      return {
        ...node,
        x: 550 + Math.cos(rad) * 440,
        y: 280 + Math.sin(rad) * 200,
      };
    });
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof computedNodes[0]>();
    computedNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [computedNodes]);

  // Filter nodes based on selected mode
  const visibleNodes = useMemo(() => {
    if (graphFilter === 'CORE_NEXUS') {
      // Show core 8 most essential nodes for direct jury explanation
      const coreIds = new Set([
        'P-001', 'A-001', 'P-004', 'L-001', 'PH-002', 'P-002', 'ORG-002', 'V-001', 'A-003', 'P-003'
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
    setZoom((prev) => Math.min(Math.max(0.4, prev + delta), 2.2));
  };

  const resetView = () => {
    setZoom(0.95);
    setPan({ x: 10, y: 15 });
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

  const getNodeColors = (type: string, isSelected: boolean, isTimelineActive: boolean, isNexus: boolean) => {
    if (isTimelineActive) {
      return {
        bg: 'fill-cyan-500',
        stroke: '#0284c7',
        strokeWidth: 3.5,
        badgeBg: 'fill-cyan-100 dark:fill-cyan-950',
        badgeStroke: '#0284c7',
        badgeText: 'fill-cyan-950 dark:fill-cyan-200',
        icon: 'text-white',
      };
    }
    if (isSelected) {
      return {
        bg: 'fill-amber-500',
        stroke: '#d97706',
        strokeWidth: 3.5,
        badgeBg: 'fill-amber-100 dark:fill-amber-950',
        badgeStroke: '#d97706',
        badgeText: 'fill-amber-950 dark:fill-amber-200',
        icon: 'text-white',
      };
    }

    if (isLight) {
      switch (type) {
        case 'PERSON':
          return {
            bg: isNexus ? 'fill-cyan-50' : 'fill-white',
            stroke: '#0891b2',
            strokeWidth: isNexus ? 3 : 2,
            badgeBg: 'fill-white',
            badgeStroke: '#0891b2',
            badgeText: 'fill-slate-900',
            icon: 'text-cyan-700',
          };
        case 'ACCOUNT':
          return {
            bg: isNexus ? 'fill-emerald-50' : 'fill-white',
            stroke: '#059669',
            strokeWidth: 3.5,
            badgeBg: 'fill-white',
            badgeStroke: '#059669',
            badgeText: 'fill-slate-900',
            icon: 'text-emerald-700',
          };
        case 'LOCATION':
          return {
            bg: 'fill-amber-50',
            stroke: '#d97706',
            strokeWidth: 2.2,
            badgeBg: 'fill-white',
            badgeStroke: '#d97706',
            badgeText: 'fill-slate-900',
            icon: 'text-amber-700',
          };
        case 'PHONE':
          return {
            bg: 'fill-indigo-50',
            stroke: '#4f46e5',
            strokeWidth: 2,
            badgeBg: 'fill-white',
            badgeStroke: '#4f46e5',
            badgeText: 'fill-slate-900',
            icon: 'text-indigo-700',
          };
        case 'ORGANIZATION':
          return {
            bg: 'fill-purple-50',
            stroke: '#9333ea',
            strokeWidth: 2,
            badgeBg: 'fill-white',
            badgeStroke: '#9333ea',
            badgeText: 'fill-slate-900',
            icon: 'text-purple-700',
          };
        case 'VEHICLE':
          return {
            bg: 'fill-rose-50',
            stroke: '#e11d48',
            strokeWidth: 2,
            badgeBg: 'fill-white',
            badgeStroke: '#e11d48',
            badgeText: 'fill-slate-900',
            icon: 'text-rose-700',
          };
        default:
          return {
            bg: 'fill-slate-50',
            stroke: '#64748b',
            strokeWidth: 1.8,
            badgeBg: 'fill-white',
            badgeStroke: '#64748b',
            badgeText: 'fill-slate-900',
            icon: 'text-slate-700',
          };
      }
    }

    // Dark Mode
    switch (type) {
      case 'PERSON':
        return {
          bg: isNexus ? 'fill-cyan-950' : 'fill-slate-900',
          stroke: '#22d3ee',
          strokeWidth: isNexus ? 3 : 2,
          badgeBg: 'fill-slate-900',
          badgeStroke: '#0891b2',
          badgeText: 'fill-slate-100',
          icon: 'text-cyan-400',
        };
      case 'ACCOUNT':
        return {
          bg: 'fill-emerald-950',
          stroke: '#34d399',
          strokeWidth: 3.5,
          badgeBg: 'fill-slate-900',
          badgeStroke: '#059669',
          badgeText: 'fill-emerald-200',
          icon: 'text-emerald-400',
        };
      case 'LOCATION':
        return {
          bg: 'fill-amber-950',
          stroke: '#fbbf24',
          strokeWidth: 2,
          badgeBg: 'fill-slate-900',
          badgeStroke: '#d97706',
          badgeText: 'fill-amber-200',
          icon: 'text-amber-400',
        };
      case 'PHONE':
        return {
          bg: 'fill-indigo-950',
          stroke: '#818cf8',
          strokeWidth: 2,
          badgeBg: 'fill-slate-900',
          badgeStroke: '#4f46e5',
          badgeText: 'fill-indigo-200',
          icon: 'text-indigo-400',
        };
      case 'ORGANIZATION':
        return {
          bg: 'fill-purple-950',
          stroke: '#c084fc',
          strokeWidth: 2,
          badgeBg: 'fill-slate-900',
          badgeStroke: '#9333ea',
          badgeText: 'fill-purple-200',
          icon: 'text-purple-400',
        };
      case 'VEHICLE':
        return {
          bg: 'fill-rose-950',
          stroke: '#fb7185',
          strokeWidth: 2,
          badgeBg: 'fill-slate-900',
          badgeStroke: '#e11d48',
          badgeText: 'fill-rose-200',
          icon: 'text-rose-400',
        };
      default:
        return {
          bg: 'fill-slate-900',
          stroke: '#94a3b8',
          strokeWidth: 1.8,
          badgeBg: 'fill-slate-900',
          badgeStroke: '#64748b',
          badgeText: 'fill-slate-200',
          icon: 'text-slate-400',
        };
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-100/80 dark:bg-slate-950 overflow-hidden flex flex-col select-none transition-colors">
      {/* 1. Top Jury Key Finding Banner (Instant 2-Second Clarity for Judges) */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex flex-col gap-1.5 max-w-[calc(100%-1rem)] pointer-events-none">
        <div className="pointer-events-auto flex items-center space-x-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-md transition-colors">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
          <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            PRIMARY INVESTIGATION PROOF:
          </span>
          <span className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-sans truncate">
            Marcus Vance <strong className="text-cyan-700 dark:text-cyan-400 font-mono">(P-001)</strong> &amp; Julian Thorne <strong className="text-cyan-700 dark:text-cyan-400 font-mono">(P-004)</strong> converge on Shared Account <strong className="text-emerald-700 dark:text-emerald-400 font-mono">A-001</strong> ($250k Wire).
          </span>
        </div>

        {/* Filter Presets */}
        <div className="pointer-events-auto flex items-center space-x-1 sm:space-x-1.5 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md p-1 rounded-xl shadow-sm self-start">
          <Filter className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ml-1.5 mr-0.5 flex-shrink-0" />
          <button
            onClick={() => setGraphFilter('CORE_NEXUS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
              graphFilter === 'CORE_NEXUS'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Core Nexus (Clean Focus)
          </button>
          <button
            onClick={() => setGraphFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
              graphFilter === 'ALL'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All 37 Nodes
          </button>
          <button
            onClick={() => setGraphFilter('FINANCIAL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
              graphFilter === 'FINANCIAL'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Financial Links
          </button>
        </div>
      </div>

      {/* 2. Top Right Zoom & Controls */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center space-x-1 sm:space-x-1.5 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md p-1 rounded-xl shadow-md transition-colors">
        <button
          onClick={() => handleZoom(0.15)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Bottom Legend */}
      <div className="hidden md:flex absolute bottom-3 right-3 z-20 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md text-[10px] items-center gap-x-3 text-slate-700 dark:text-slate-300 font-mono transition-colors">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm" />
          <span className="font-semibold">PERSON</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-sm" />
          <span className="font-semibold">ACCOUNT</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-500 shadow-sm" />
          <span className="font-semibold">LOCATION</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-sm" />
          <span className="font-semibold">PHONE</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-rose-500 shadow-sm" />
          <span className="font-semibold">VEHICLE</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-purple-500 shadow-sm" />
          <span className="font-semibold">ORGANIZATION</span>
        </span>
      </div>

      {/* 4. Interactive SVG Canvas */}
      <svg
        id="graph-bg"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          <pattern id="graph-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="24" cy="24" r="1.2" className="fill-slate-300/80 dark:fill-slate-800" />
          </pattern>

          {/* Clean Drop Shadow Filter for Badges */}
          <filter id="badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity={isLight ? '0.10' : '0.40'} />
          </filter>

          {/* Standard Arrowhead */}
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

          {/* Nexus Primary Arrowhead */}
          <marker
            id="arrowhead-nexus"
            markerWidth="10"
            markerHeight="8"
            refX="24"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 10 4, 0 8" fill="#0284c7" />
          </marker>

          {/* Selected Arrowhead */}
          <marker
            id="arrowhead-selected"
            markerWidth="10"
            markerHeight="8"
            refX="24"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 10 4, 0 8" fill="#d97706" />
          </marker>
        </defs>

        <rect width="100%" height="100%" fill="url(#graph-grid)" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* A. Render Background Connecting Conduit for the Marcus -> A-001 -> Julian Highway */}
          {graphFilter === 'CORE_NEXUS' && (
            <path
              d="M 240 280 L 550 280 L 860 280"
              fill="none"
              stroke={isLight ? '#e0f2fe' : '#082f49'}
              strokeWidth="24"
              strokeLinecap="round"
              className="opacity-70"
            />
          )}

          {/* B. Render Edges (Relationships) */}
          {visibleEdges.map((edge) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;

            const isDirectlySelected = selectedRelationshipId === edge.id;
            const isConnectedToSelectedNode =
              selectedEntityId === edge.source || selectedEntityId === edge.target;
            const isTimelineActive =
              activeEntityIds.has(edge.source) && activeEntityIds.has(edge.target);

            const isPrimaryNexus =
              (edge.source === 'P-001' && edge.target === 'A-001') ||
              (edge.source === 'P-004' && edge.target === 'A-001') ||
              (edge.source === 'A-001' && edge.target === 'P-001') ||
              (edge.source === 'A-001' && edge.target === 'P-004');

            // Midpoint for badge placement
            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            let strokeColor = isLight ? '#94a3b8' : '#334155';
            let marker = 'url(#arrowhead)';
            let strokeWidth = 1.8;
            let opacity = selectedEntityId && !isConnectedToSelectedNode ? 0.25 : 1;

            if (isDirectlySelected) {
              strokeColor = '#d97706';
              marker = 'url(#arrowhead-selected)';
              strokeWidth = 3.5;
              opacity = 1;
            } else if (isTimelineActive) {
              strokeColor = '#0284c7';
              marker = 'url(#arrowhead-nexus)';
              strokeWidth = 3.2;
              opacity = 1;
            } else if (isPrimaryNexus) {
              strokeColor = '#0284c7';
              marker = 'url(#arrowhead-nexus)';
              strokeWidth = 2.8;
              opacity = 1;
            } else if (isConnectedToSelectedNode) {
              strokeColor = '#0ea5e9';
              strokeWidth = 2.5;
              opacity = 1;
            }

            const cleanLabel = getCleanEdgeLabel(edge);
            const badgeWidth = Math.max(90, cleanLabel.length * 6.8 + 16);

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
                {/* Thick invisible click area */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="transparent"
                  strokeWidth="28"
                />

                {/* Visible crisp relationship line */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={edge.status === 'UNVERIFIED' ? '5,5' : undefined}
                  markerEnd={marker}
                  className="transition-all duration-300 group-hover:stroke-cyan-500 group-hover:stroke-[3]"
                />

                {/* Relationship Pill Badge (Solid background prevents line collision) */}
                <g transform={`translate(${midX}, ${midY})`} filter="url(#badge-shadow)">
                  <rect
                    x={-badgeWidth / 2}
                    y="-11"
                    width={badgeWidth}
                    height="22"
                    rx="11"
                    className={`transition-all ${
                      isDirectlySelected
                        ? 'fill-amber-50 stroke-amber-500 dark:fill-amber-950 dark:stroke-amber-400'
                        : isTimelineActive || isPrimaryNexus
                        ? 'fill-cyan-50 stroke-cyan-500 dark:fill-cyan-950 dark:stroke-cyan-400'
                        : isConnectedToSelectedNode
                        ? 'fill-sky-50 stroke-sky-500 dark:fill-slate-900 dark:stroke-sky-400'
                        : 'fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-700 group-hover:stroke-cyan-500'
                    }`}
                    strokeWidth={isDirectlySelected || isPrimaryNexus ? '1.8' : '1.2'}
                  />
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    className={`text-[9px] font-mono tracking-tight ${
                      isDirectlySelected
                        ? 'fill-amber-900 dark:fill-amber-300 font-bold'
                        : isTimelineActive || isPrimaryNexus
                        ? 'fill-cyan-950 dark:fill-cyan-200 font-bold'
                        : isConnectedToSelectedNode
                        ? 'fill-sky-900 dark:fill-sky-200 font-bold'
                        : 'fill-slate-800 dark:fill-slate-300 font-semibold group-hover:fill-cyan-700 dark:group-hover:fill-cyan-200'
                    }`}
                  >
                    {cleanLabel}
                  </text>
                </g>
              </g>
            );
          })}

          {/* C. Render Nodes (Entities) */}
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
            const isSpecialNexus = ['P-001', 'A-001', 'P-004'].includes(node.id);
            const colors = getNodeColors(node.entity_type, Boolean(isHighlight), isTimelineActive, isSpecialNexus);
            const Icon = getNodeIcon(node.entity_type);
            const radius = isSpecialNexus ? 26 : 20;

            const cleanLabel = getCleanLabel(node);
            const roleTag = getRoleTag(node);

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
                {/* Pulsing focal beacon for Primary Nexus Nodes */}
                {isSpecialNexus && (
                  <circle
                    r={radius + 8}
                    className="fill-none stroke-cyan-500/40 animate-pulse"
                    strokeWidth="1.8"
                  />
                )}

                {/* Node Main Circle */}
                <circle
                  r={radius}
                  className={`${colors.bg} transition-all duration-300 group-hover:scale-105 shadow-md`}
                  stroke={colors.stroke}
                  strokeWidth={colors.strokeWidth}
                />

                {/* Node Icon */}
                <g transform="translate(-8, -8)" pointerEvents="none">
                  <Icon className={`w-4 h-4 ${colors.icon}`} />
                </g>

                {/* Entity Label Card Pill (Masked underneath circle for zero line overlap) */}
                <g transform={`translate(0, ${radius + 15})`} filter="url(#badge-shadow)">
                  <rect
                    x="-65"
                    y="-10"
                    width="130"
                    height="28"
                    rx="8"
                    className={`${colors.badgeBg} ${isHighlight ? 'stroke-amber-500 dark:stroke-amber-400' : 'stroke-slate-200 dark:stroke-slate-700/80'} group-hover:stroke-cyan-500 transition-all`}
                    strokeWidth="1.2"
                  />
                  {/* Entity Title */}
                  <text
                    y="-0.5"
                    textAnchor="middle"
                    className={`text-[11px] font-bold tracking-tight ${colors.badgeText} font-sans`}
                  >
                    {cleanLabel}
                  </text>
                  {/* ID and Role Subtitle */}
                  <text
                    y="11"
                    textAnchor="middle"
                    className="text-[8.5px] font-mono fill-slate-500 dark:fill-slate-400 font-bold tracking-wider uppercase"
                  >
                    {node.id} • {roleTag}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* 5. Rich Hover Tooltip Details */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl max-w-xs text-xs transition-colors">
          <div className="flex items-center justify-between space-x-2 mb-1">
            <span className="font-bold text-slate-900 dark:text-white text-xs truncate">{hoveredNode.label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-mono font-bold">
              {hoveredNode.entity_type}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-1 font-semibold">
            ID: {hoveredNode.id} • Role: {getRoleTag(hoveredNode)}
          </div>
          {hoveredNode.description && (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{hoveredNode.description}</p>
          )}
        </div>
      )}
    </div>
  );
};
