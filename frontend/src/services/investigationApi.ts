import {
  CaseSummary,
  CaseDetail,
  Entity,
  EntityDetail,
  GraphNetworkResponse,
  TimelineEvent,
  RelationshipEvidence,
  InvestigationQueryRequest,
  InvestigationQueryResponse,
  GraphStats,
} from '../types/investigation';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function getCases(): Promise<CaseSummary[]> {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error(`Failed to fetch cases: ${res.statusText}`);
  return res.json();
}

export async function getCase(caseId: string): Promise<CaseDetail> {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) throw new Error(`Failed to fetch case ${caseId}: ${res.statusText}`);
  return res.json();
}

export async function getCaseNetwork(caseId: string): Promise<GraphNetworkResponse> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/network`);
  if (!res.ok) throw new Error(`Failed to fetch network for case ${caseId}: ${res.statusText}`);
  return res.json();
}

export async function getCaseTimeline(caseId: string): Promise<{ case_id: string; total_events: number; events: TimelineEvent[] }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/timeline`);
  if (!res.ok) throw new Error(`Failed to fetch timeline for case ${caseId}: ${res.statusText}`);
  return res.json();
}

export async function getEntities(): Promise<Entity[]> {
  const res = await fetch(`${API_BASE}/entities`);
  if (!res.ok) throw new Error(`Failed to fetch entities: ${res.statusText}`);
  return res.json();
}

export async function getEntity(entityId: string): Promise<EntityDetail> {
  const res = await fetch(`${API_BASE}/entities/${entityId}`);
  if (!res.ok) throw new Error(`Failed to fetch entity ${entityId}: ${res.statusText}`);
  return res.json();
}

export async function getRelationshipEvidence(relationshipId: string): Promise<RelationshipEvidence> {
  const res = await fetch(`${API_BASE}/relationships/${relationshipId}/evidence`);
  if (!res.ok) throw new Error(`Failed to fetch evidence for relationship ${relationshipId}: ${res.statusText}`);
  return res.json();
}

export async function queryInvestigation(request: InvestigationQueryRequest): Promise<InvestigationQueryResponse> {
  const res = await fetch(`${API_BASE}/investigation/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Investigation query failed: ${res.statusText}`);
  return res.json();
}

export async function getGraphStats(): Promise<GraphStats> {
  const res = await fetch(`${API_BASE}/graph/stats`);
  if (!res.ok) throw new Error(`Failed to fetch graph stats: ${res.statusText}`);
  return res.json();
}
