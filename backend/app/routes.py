"""FastAPI route handlers."""

from fastapi import APIRouter, HTTPException

from app.schemas import ChatRequest, ChatResponse, HealthResponse
from app.services.diagnostic import (
    build_intake_prompt,
    build_web_consent_prompt,
    conversation_text,
    is_diagnostic_intent,
    is_emergency_red_flag,
    missing_intake_fields,
    search_query_from_conversation,
    web_consent_state,
)
from app.services.generator import generate_answer, generate_diagnostic_answer
from app.services.ingestion import ingest_default_documents
from app.services.retriever import retrieve
from app.services.safety import (
    build_refusal,
    check_safety_guardrails,
    is_prompt_injection,
    is_treatment_or_prescription,
)
from app.services.vector_store import vector_store
from app.services.web_search import search_public_sources

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        documents_indexed=vector_store.count,
        vector_store_ready=vector_store.count > 0,
    )


@router.post("/ingest")
def ingest(reset: bool = False) -> dict:
    count = ingest_default_documents(reset=reset)
    return {"indexed_chunks": count, "message": f"Indexed {count} evidence chunks."}


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    question = request.question.strip()
    history = [turn.model_dump() for turn in request.history]
    combined = conversation_text(history, question)

    if is_prompt_injection(question):
        return ChatResponse(
            answer=build_refusal("GUARDRAIL_BLOCKED"),
            retrieval=_empty_retrieval(question),
            refused=True,
            refusal_reason="GUARDRAIL_BLOCKED",
        )
    if is_treatment_or_prescription(question):
        return ChatResponse(
            answer=build_refusal("TREATMENT_PRESCRIPTION_REFUSAL"),
            retrieval=_empty_retrieval(question),
            refused=True,
            refusal_reason="TREATMENT_PRESCRIPTION_REFUSAL",
        )

    if is_diagnostic_intent(combined):
        return _diagnostic_chat(question, history, request.allow_web_search, combined)

    blocked, refusal_reason = check_safety_guardrails(question)
    if blocked and refusal_reason:
        return ChatResponse(
            answer=build_refusal(refusal_reason),
            retrieval=_empty_retrieval(question),
            refused=True,
            refusal_reason=refusal_reason,
        )

    evidence, retrieval_meta = retrieve(question)

    if not retrieval_meta.passed_evidence_gate:
        return ChatResponse(
            answer=build_refusal("INSUFFICIENT_EVIDENCE"),
            evidence=evidence,
            retrieval=retrieval_meta,
            refused=True,
            refusal_reason="INSUFFICIENT_EVIDENCE",
        )

    try:
        answer, citations = generate_answer(question, evidence, history=history)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM generation failed: {exc}") from exc

    return ChatResponse(
        answer=answer,
        citations=citations,
        evidence=evidence,
        retrieval=retrieval_meta,
        refused=False,
    )


def _diagnostic_chat(
    question: str,
    history: list[dict],
    allow_web_search: bool | None,
    combined: str,
) -> ChatResponse:
    emergency = is_emergency_red_flag(combined)
    missing = missing_intake_fields(combined)
    if missing:
        return ChatResponse(
            answer=build_intake_prompt(missing, emergency),
            retrieval=_empty_retrieval(question),
            refused=False,
            mode="diagnostic_intake",
        )

    consent = web_consent_state(history, question)
    if allow_web_search is True:
        consent = "yes"
    elif allow_web_search is False:
        consent = "no"

    if consent == "unknown":
        return ChatResponse(
            answer=build_web_consent_prompt(emergency),
            retrieval=_empty_retrieval(question),
            refused=False,
            mode="diagnostic_intake",
            needs_web_search_consent=True,
        )

    search_query = search_query_from_conversation(combined)
    evidence, retrieval_meta = retrieve(search_query + " " + question)
    web_sources = []
    if consent == "yes":
        web_sources = search_public_sources(search_query)

    try:
        answer, citations = generate_diagnostic_answer(
            question, combined, evidence, web_sources
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM generation failed: {exc}") from exc

    return ChatResponse(
        answer=answer,
        citations=citations,
        evidence=evidence,
        retrieval=retrieval_meta,
        refused=False,
        mode="diagnostic_answer",
        web_sources=web_sources,
    )


def _empty_retrieval(question: str):
    from app.config import settings
    from app.schemas import RetrievalMeta

    return RetrievalMeta(
        query=question,
        top_k=settings.retrieval_top_k,
        min_score_threshold=settings.min_relevance_score,
        chunks_retrieved=0,
        max_score=None,
        passed_evidence_gate=False,
    )
