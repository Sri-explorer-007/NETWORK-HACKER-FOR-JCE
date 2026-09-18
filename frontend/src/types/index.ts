export interface HealthStatus {
  status: string;
  service: string;
  timestamp?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight?: number;
  timestamp?: string;
  evidenceIds?: string[];
}

export interface EvidenceItem {
  id: string;
  source: string;
  content: string;
  timestamp: string;
  confidence: number;
}
