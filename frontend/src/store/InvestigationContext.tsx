import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CaseSummary,
  CaseDetail,
  GraphNetworkResponse,
  TimelineEvent,
  RelationshipEvidence,
  InvestigationQueryResponse,
} from '../types/investigation';
import * as api from '../services/investigationApi';

interface InvestigationContextType {
  activeCaseId: string;
  activeCase: CaseDetail | null;
  cases: CaseSummary[];
  network: GraphNetworkResponse | null;
  timeline: TimelineEvent[];
  selectedEntityId: string | null;
  selectedRelationshipId: string | null;
  selectedEvidenceId: string | null;
  relationshipEvidence: RelationshipEvidence | null;
  timelineIndex: number;
  isPlayingTimeline: boolean;
  activeView: 'dashboard' | 'workspace' | 'network' | 'replay' | 'patterns' | 'evidence' | 'assistant';
  graphFilter: 'ALL' | 'CORE_NEXUS' | 'FINANCIAL' | 'PERSON' | 'ACCOUNT';
  focusMode: boolean;
  theme: 'light' | 'dark';
  aiQuery: string;
  aiResponse: InvestigationQueryResponse | null;
  aiLoading: boolean;
  aiError: string | null;
  reportModalOpen: boolean;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  
  // Actions
  setActiveCaseId: (id: string) => void;
  selectEntity: (id: string | null) => void;
  selectRelationship: (id: string | null) => void;
  selectEvidence: (id: string | null) => void;
  setTimelineIndex: (index: number) => void;
  toggleTimelinePlay: () => void;
  setActiveView: (view: 'dashboard' | 'workspace' | 'network' | 'replay' | 'patterns' | 'evidence' | 'assistant') => void;
  setGraphFilter: (filter: 'ALL' | 'CORE_NEXUS' | 'FINANCIAL' | 'PERSON' | 'ACCOUNT') => void;
  toggleFocusMode: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  resetInvestigationView: () => void;
  runAiQuery: (query: string) => Promise<void>;
  setReportModalOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  refreshData: () => void;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

// Mapping of evidence IDs to their primary representative relationship for auto-highlighting
const EVIDENCE_RELATIONSHIP_MAP: Record<string, string> = {
  'EVD-001': 'REL-001',
  'EVD-002': 'REL-001',
  'EVD-003': 'REL-001',
  'EVD-004': 'REL-002',
  'EVD-005': 'REL-001', // Marcus Vance -> A-001
  'EVD-006': 'REL-003',
  'EVD-007': 'REL-004',
  'EVD-008': 'REL-005',
  'EVD-009': 'REL-006',
  'EVD-010': 'REL-007',
  'EVD-011': 'REL-008',
  'EVD-012': 'REL-009',
  'EVD-013': 'REL-010',
  'EVD-014': 'REL-011',
  'EVD-015': 'REL-002', // Julian Thorne -> A-001
  'EVD-016': 'REL-013',
  'EVD-017': 'REL-014', // Contradicted warehouse claim
  'EVD-018': 'REL-015',
  'EVD-019': 'REL-016',
  'EVD-020': 'REL-017',
  'EVD-021': 'REL-018',
  'EVD-022': 'REL-019',
  'EVD-023': 'REL-020',
  'EVD-024': 'REL-021',
  'EVD-025': 'REL-022',
};

export const InvestigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Primary state: load CASE-001 by default for zero-config demo
  const [activeCaseId, setActiveCaseIdState] = useState<string>('CASE-001');
  const [activeCase, setActiveCase] = useState<CaseDetail | null>(null);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [network, setNetwork] = useState<GraphNetworkResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [relationshipEvidence, setRelationshipEvidence] = useState<RelationshipEvidence | null>(null);
  
  const [timelineIndex, setTimelineIndex] = useState<number>(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  
  const [activeView, setActiveView] = useState<'dashboard' | 'workspace' | 'network' | 'replay' | 'patterns' | 'evidence' | 'assistant'>('workspace');
  const [graphFilter, setGraphFilter] = useState<'ALL' | 'CORE_NEXUS' | 'FINANCIAL' | 'PERSON' | 'ACCOUNT'>('CORE_NEXUS');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('network_hunter_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Default to clean bright/light theme as requested
  });

  // Sync theme to <html> element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('network_hunter_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  }, []);
  
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<InvestigationQueryResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial Load: Fetch Cases, Active Case Details, Network Graph, and Timeline
  const loadCaseData = useCallback(async (caseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [caseList, caseDetails, networkData, timelineData] = await Promise.all([
        api.getCases().catch(() => []),
        api.getCase(caseId).catch(() => null),
        api.getCaseNetwork(caseId).catch(() => null),
        api.getCaseTimeline(caseId).catch(() => ({ case_id: caseId, total_events: 0, events: [] })),
      ]);

      setCases(caseList);
      setActiveCase(caseDetails);
      setNetwork(networkData);
      setTimeline(timelineData.events || []);
      setTimelineIndex(0);
    } catch (err: any) {
      setError('Investigation data could not be retrieved.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaseData(activeCaseId);
  }, [activeCaseId, loadCaseData]);

  // Clean case switching
  const setActiveCaseId = useCallback((caseId: string) => {
    setSelectedEntityId(null);
    setSelectedRelationshipId(null);
    setSelectedEvidenceId(null);
    setRelationshipEvidence(null);
    setTimelineIndex(0);
    setIsPlayingTimeline(false);
    setAiQuery('');
    setAiResponse(null);
    setAiError(null);
    setActiveCaseIdState(caseId);
  }, []);

  // 2. Fetch Evidence whenever a Relationship is selected
  const selectRelationship = useCallback(async (relId: string | null) => {
    setSelectedRelationshipId(relId);
    if (!relId) {
      setRelationshipEvidence(null);
      return;
    }
    try {
      const evData = await api.getRelationshipEvidence(relId);
      setRelationshipEvidence(evData);
      if (evData.evidence_items && evData.evidence_items.length > 0) {
        setSelectedEvidenceId(evData.evidence_items[0].id);
      }
    } catch (err) {
      console.error(`Failed to load evidence for relationship ${relId}:`, err);
    }
  }, []);

  const selectEntity = useCallback((entityId: string | null) => {
    setSelectedEntityId(entityId);
  }, []);

  // Synchronized selectEvidence: Highlights relationship and opens evidence drawer
  const selectEvidence = useCallback(async (evidenceId: string | null) => {
    setSelectedEvidenceId(evidenceId);
    if (!evidenceId) return;

    const mappedRelId = EVIDENCE_RELATIONSHIP_MAP[evidenceId];
    if (mappedRelId) {
      setSelectedRelationshipId(mappedRelId);
      try {
        const evData = await api.getRelationshipEvidence(mappedRelId);
        setRelationshipEvidence(evData);
      } catch (err) {
        console.error(`Failed to load evidence for mapped relationship ${mappedRelId}:`, err);
      }
    }
  }, []);

  // 3. AI Investigation Query
  const runAiQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiQuery(queryText);
    try {
      const response = await api.queryInvestigation({
        query: queryText,
        case_id: activeCaseId,
        top_k: 5,
      });
      setAiResponse(response);
    } catch (err: any) {
      setAiError('Grounded analysis is temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  }, [activeCaseId]);

  // 4. Timeline Playback loop
  useEffect(() => {
    let interval: any = null;
    if (isPlayingTimeline && timeline.length > 0) {
      interval = setInterval(() => {
        setTimelineIndex((prev) => {
          if (prev >= timeline.length - 1) {
            setIsPlayingTimeline(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingTimeline, timeline.length]);

  const toggleTimelinePlay = useCallback(() => {
    setIsPlayingTimeline((prev) => !prev);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev);
  }, []);

  // 5. Complete Reset View to default jury presentation state
  const resetInvestigationView = useCallback(() => {
    setSelectedEntityId(null);
    setSelectedRelationshipId(null);
    setSelectedEvidenceId(null);
    setRelationshipEvidence(null);
    setTimelineIndex(0);
    setIsPlayingTimeline(false);
    setGraphFilter('CORE_NEXUS');
    setAiQuery('');
    setAiResponse(null);
    setAiError(null);
    setSearchQuery('');
    setActiveView('workspace');
    if (activeCaseId !== 'CASE-001') {
      setActiveCaseIdState('CASE-001');
    }
  }, [activeCaseId]);

  const refreshData = useCallback(() => {
    loadCaseData(activeCaseId);
  }, [activeCaseId, loadCaseData]);

  return (
    <InvestigationContext.Provider
      value={{
        activeCaseId,
        activeCase,
        cases,
        network,
        timeline,
        selectedEntityId,
        selectedRelationshipId,
        selectedEvidenceId,
        relationshipEvidence,
        timelineIndex,
        isPlayingTimeline,
        activeView,
        graphFilter,
        focusMode,
        theme,
        aiQuery,
        aiResponse,
        aiLoading,
        aiError,
        reportModalOpen,
        searchQuery,
        loading,
        error,

        setActiveCaseId,
        selectEntity,
        selectRelationship,
        selectEvidence,
        setTimelineIndex,
        toggleTimelinePlay,
        setActiveView,
        setGraphFilter,
        toggleFocusMode,
        toggleTheme,
        setTheme,
        resetInvestigationView,
        runAiQuery,
        setReportModalOpen,
        setSearchQuery,
        refreshData,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};

export const useInvestigation = () => {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
};
