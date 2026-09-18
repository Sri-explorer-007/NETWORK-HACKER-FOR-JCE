export interface CaseSummary {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface CaseEntityRole {
  entity_id: string;
  name: string;
  entity_type: string;
  role: string;
}

export interface CaseDetail extends CaseSummary {
  entities: CaseEntityRole[];
  entities_count: number;
  relationships_count: number;
  events_count: number;
  sources_count: number;
  evidence_count: number;
}

export interface Entity {
  id: string;
  name: string;
  entity_type: 'PERSON' | 'ORGANIZATION' | 'ACCOUNT' | 'PHONE' | 'VEHICLE' | 'LOCATION' | 'DEVICE';
  description?: string;
  status: string;
  attributes?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface EntityDetail extends Entity {
  associated_cases: string[];
  direct_connections_count: number;
}

export interface Relationship {
  id: string;
  from_entity_id: string;
  to_entity_id: string;
  relationship_type: string;
  description?: string;
  confidence: number;
  status: string;
  start_time?: string;
  end_time?: string;
  source_id?: string;
  case_id?: string;
}

export interface Source {
  id: string;
  source_type: string;
  reference_code: string;
  title: string;
  source_date: string;
  status: string;
  case_id?: string;
}

export interface Evidence {
  id: string;
  source_id: string;
  case_id?: string;
  evidence_type: string;
  title: string;
  content: string;
  evidence_date: string;
  verification_status: 'VERIFIED' | 'OBSERVED' | 'UNVERIFIED' | 'AMBIGUOUS' | 'CONTRADICTED';
  extra_metadata?: Record<string, any>;
}

export interface RelationshipEvidence {
  relationship: Relationship;
  source?: Source | null;
  evidence_items: Evidence[];
  provenance_chain: string[];
}

export interface EventParticipant {
  entity_id: string;
  name: string;
  entity_type: string;
  role: string;
}

export interface TimelineEvent {
  id: string;
  event_type: string;
  timestamp: string;
  description: string;
  location_id?: string | null;
  location_name?: string | null;
  case_id?: string;
  source_id?: string;
  created_at: string;
  entities: EventParticipant[];
}

export interface GraphNode {
  id: string;
  label: string;
  entity_type: string;
  status: string;
  description?: string;
  attributes?: Record<string, any>;
  case_role?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship_type: string;
  description?: string;
  confidence: number;
  status: string;
  start_time?: string;
  end_time?: string;
  source_id?: string;
  case_id?: string;
}

export interface GraphNetworkResponse {
  case_id: string;
  total_nodes: number;
  total_edges: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Finding {
  statement: string;
  finding_type: 'OBSERVED' | 'VERIFIED' | 'INFERRED' | 'AMBIGUOUS' | 'CONTRADICTED' | 'INSUFFICIENT_EVIDENCE';
  evidence_ids: string[];
  source_ids: string[];
  relationship_ids: string[];
  confidence_label: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

export interface InvestigationQueryRequest {
  query: string;
  case_id?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  source_type?: string | null;
  verification_status?: string | null;
  top_k?: number;
}

export interface InvestigationQueryResponse {
  query: string;
  mode: 'LLM' | 'DEMO_FALLBACK';
  answer: string;
  findings: Finding[];
  source_ids: string[];
  evidence_ids: string[];
  relationship_ids: string[];
  entity_ids: string[];
  caveats: string[];
  requires_human_review: boolean;
}

export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  density: number;
  connected_components: number;
  node_types: Record<string, number>;
}
