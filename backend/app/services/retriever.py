"""Retrieval service with evidence gate and multilingual support."""

from app.config import settings
from app.schemas import EvidenceChunk, RetrievalMeta
from app.services.safety import is_arabic
from app.services.vector_store import vector_store


def translate_query_for_retrieval(question: str) -> str:
    """Translate non-English query to English search terms for optimal guideline retrieval."""
    if not is_arabic(question):
        return question

    # Quick keyword dictionary for screening concepts
    ar_en_map = {
        "فحص": "screening",
        "سرطان الرئة": "lung cancer",
        "مؤهل": "eligible eligibility criteria",
        "عمر": "age 50 80 years",
        "تدخين": "smoking pack-year",
        "أشعة مقطعية": "low-dose computed tomography LDCT",
        "توصيات": "guidelines USPSTF ACS recommendations",
        "إقلاع": "quit 15 years",
        "مخاطر": "harms benefits radiation",
        "عقدة": "nodule Lung-RADS",
        "سنوي": "annual screening",
        "سعال": "cough symptoms",
        "كحة": "cough",
    }

    # Use Gemini for clinical translation if API key is available
    if settings.gemini_api_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.gemini_api_key)
            resp = client.models.generate_content(
                model=settings.gemini_chat_model,
                contents=(
                    "Translate this lung cancer screening query into concise English search keywords "
                    "for guideline document retrieval. Return ONLY English search terms:\n"
                    f"{question}"
                ),
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    max_output_tokens=60,
                ),
            )
            translated = (resp.text or "").strip()
            if translated and len(translated) > 3:
                return translated
        except Exception:
            pass

    # Keyword fallback
    expanded = [question]
    for ar, en in ar_en_map.items():
        if ar in question:
            expanded.append(en)
    return " ".join(expanded)


def retrieve(question: str) -> tuple[list[EvidenceChunk], RetrievalMeta]:
    if vector_store.count == 0:
        try:
            from app.services.ingestion import ingest_default_documents
            ingest_default_documents()
        except Exception as exc:
            print(f"Auto-ingest error: {exc}", flush=True)

    raw_chunks = vector_store.query(question, top_k=settings.retrieval_top_k)

    # If non-English (e.g. Arabic), perform dual retrieval with translated clinical keywords
    if is_arabic(question):
        en_query = translate_query_for_retrieval(question)
        if en_query and en_query != question:
            en_chunks = vector_store.query(en_query, top_k=settings.retrieval_top_k)
            # Merge and deduplicate by id, keeping highest score
            merged_map: dict[str, dict] = {}
            for chunk in raw_chunks + en_chunks:
                cid = chunk.get("id", chunk.get("content", ""))
                if cid not in merged_map or chunk.get("score", 0) > merged_map[cid].get("score", 0):
                    merged_map[cid] = chunk
            raw_chunks = sorted(merged_map.values(), key=lambda c: c.get("score", 0), reverse=True)[: settings.retrieval_top_k]

    evidence = [EvidenceChunk(**chunk) for chunk in raw_chunks]
    max_score = max((c.score for c in evidence), default=None)

    passed = bool(
        evidence
        and max_score is not None
        and max_score >= settings.min_relevance_score
    )

    meta = RetrievalMeta(
        query=question,
        top_k=settings.retrieval_top_k,
        min_score_threshold=settings.min_relevance_score,
        chunks_retrieved=len(evidence),
        max_score=max_score,
        passed_evidence_gate=passed,
    )
    return evidence, meta

