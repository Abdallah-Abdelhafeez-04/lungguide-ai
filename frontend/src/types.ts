export interface Citation {
  document: string;
  section: string;
  page: string;
  excerpt: string;
  url?: string;
  source_type?: "guideline" | "research" | "web";
}

export interface WebSource {
  title: string;
  url: string;
  snippet: string;
}

export interface EvidenceChunk {
  id: string;
  content: string;
  score: number;
  document: string;
  section: string;
  page: string;
  source_type?: "guideline" | "research" | "web";
}

export interface RetrievalMeta {
  query: string;
  top_k: number;
  min_score_threshold: number;
  chunks_retrieved: number;
  max_score: number | null;
  passed_evidence_gate: boolean;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  evidence: EvidenceChunk[];
  retrieval: RetrievalMeta;
  refused: boolean;
  refusal_reason: string | null;
  scope: string;
  mode?: string;
  needs_web_search_consent?: boolean;
  web_sources?: WebSource[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  response?: ChatResponse;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  latestResponse: ChatResponse | null;
}
