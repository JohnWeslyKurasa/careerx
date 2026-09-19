export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  app_name: string;
  app_env: string;
  database_connected: boolean;
  services: {
    api_gateway: string;
    database: string;
    [key: string]: string;
  };
  timestamp: string;
}

export interface GroundedEvidenceSummary {
  evidence_id: string;
  claim_text: string;
  source_type: string;
  source_reference?: string | null;
  verifiable_url?: string | null;
  verification_url?: string | null;
  verified_skills?: string[];
  confidence_tier?: string;
  tier?: string;
  confidence_score?: number;
  retrieval_score?: number;
}

export interface RequirementScoreBreakdown {
  req_id?: string;
  requirement_id?: string;
  requirement_text: string;
  category?: string | null;
  importance_weight: number;
  match_status: 'STRONG_MATCH' | 'PARTIAL_MATCH' | 'WEAK_EVIDENCE' | 'MISSING';
  requirement_score: number;
  weighted_contribution: number;
  retrieval_similarity?: number;
  similarity_score?: number;
  confidence_tier?: string | null;
  evidence_tier?: string | null;
  confidence_multiplier: number;
  is_mandatory: boolean;
  is_critical_gap?: boolean;
  grounded_evidence?: GroundedEvidenceSummary | null;
  matched_evidence?: GroundedEvidenceSummary | null;
  diagnostic_note: string;
}

export interface JRSMatchSummary {
  total_requirements: number;
  strong_matches: number;
  partial_matches: number;
  weak_evidence?: number;
  weak_matches?: number;
  missing_requirements: number;
  critical_gaps_count?: number;
  critical_gaps?: number;
}

export interface JRSResponse {
  candidate_id: string;
  jd_id: string;
  jd_title?: string | null;
  overall_jrs: number;
  base_jrs: number;
  critical_penalty: number;
  retrieval_mode?: string;
  retrieval_mode_used?: string;
  match_summary: JRSMatchSummary;
  summary?: JRSMatchSummary;
  breakdown: RequirementScoreBreakdown[];
  critical_gaps?: string[];
  top_strengths?: string[];
  top_improvements?: string[];
  computation_latency_ms?: number;
  evaluated_at?: string;
}

export interface IngestProfileResponse {
  candidate_id: string;
  full_name?: string;
  version: number;
  evidence_count: number;
  message: string;
}

export interface IngestJDResponse {
  jd_id: string;
  title: string;
  company?: string;
  total_requirements: number;
  requirements: Array<{
    req_id: string;
    text: string;
    category: string;
    importance_weight: number;
    is_mandatory: boolean;
  }>;
}

export interface RetrievedEvidenceItem {
  evidence_id: string;
  candidate_id: string;
  claim_text: string;
  tier: string;
  source_type: string;
  verification_url?: string | null;
  sparse_score?: number | null;
  dense_score?: number | null;
  hybrid_score?: number | null;
  rerank_score?: number | null;
  final_score: number;
}

export interface RetrievalQueryResponse {
  query: string;
  candidate_id: string;
  mode_used: string;
  total_evaluated: number;
  results: RetrievedEvidenceItem[];
  latency_ms: number;
}
