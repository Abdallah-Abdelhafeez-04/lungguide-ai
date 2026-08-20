from pydantic import BaseModel, Field


class Citation(BaseModel):
    document: str
    section: str = ""
    page: str = ""
    excerpt: str
    url: str = ""
    source_type: str = "guideline"  # guideline | research | web


class WebSource(BaseModel):
    title: str
    url: str
    snippet: str = ""


class ChatTurn(BaseModel):
    role: str
    content: str


class EvidenceChunk(BaseModel):
    id: str
    content: str
    score: float
    document: str
    section: str = ""
    page: str = ""
    source_type: str = "guideline"  # guideline | research | web


class RetrievalMeta(BaseModel):
    query: str
    top_k: int
    min_score_threshold: float
    chunks_retrieved: int
    max_score: float | None = None
    passed_evidence_gate: bool


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=2000)
    history: list[ChatTurn] = []
    allow_web_search: bool | None = None


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation] = []
    evidence: list[EvidenceChunk] = []
    retrieval: RetrievalMeta
    refused: bool = False
    refusal_reason: str | None = None
    scope: str = "lung_cancer_screening"
    mode: str = "qa"
    needs_web_search_consent: bool = False
    web_sources: list[WebSource] = []


class HealthResponse(BaseModel):
    status: str
    documents_indexed: int
    vector_store_ready: bool
