"""Grounded answer generation using Gemini."""

from google import genai
from google.genai import types

from app.config import settings
from app.schemas import Citation, EvidenceChunk

SYSTEM_PROMPT = """You are LungGuide AI, an evidence-grounded educational assistant for lung cancer screening.

Rules:
1. Answer ONLY using the provided evidence passages. Do not use outside knowledge.
2. Use ONLY the numbered citation markers that match the supplied passages, for example [1] or [2]. Never write a document title, section, page, or a citation marker that was not supplied.
3. Do NOT diagnose, prescribe treatment, or give individualized medical advice.
4. If evidence is insufficient, say you cannot answer reliably.
5. Write polished Markdown for a clinical-information user. Use this exact structure when evidence supports it:
   ## Answer
   One concise direct answer with citation markers.
   ## Key details
   - Short, scannable point with citation marker.
   ## Important context
   A short safety or limitation note when supported by evidence.
   Do not add a References section; the application renders the evidence sources separately.
6. Scope: lung cancer screening guidelines (USPSTF 2021, ACS 2023 update, eligibility criteria, LDCT intervals, risks/benefits, nodule follow-up). When comparing recommendations, clearly distinguish between USPSTF (which requires quitting within 15 years) and ACS 2023 (which eliminated the 15-year quit limit).
"""


def format_evidence(evidence: list[EvidenceChunk]) -> str:
    blocks: list[str] = []
    for index, chunk in enumerate(evidence, start=1):
        blocks.append(
            f"[Citation {index}]\n"
            f"Document: {chunk.document}\n"
            f"Section: {chunk.section or 'N/A'}\n"
            f"Page: {chunk.page or 'N/A'}\n"
            f"Relevance: {chunk.score}\n"
            f"Content: {chunk.content}"
        )
    return "\n\n".join(blocks)


def generate_answer(
    question: str,
    evidence: list[EvidenceChunk],
    history: list[dict] = [],
) -> tuple[str, list[Citation]]:
    client = genai.Client(api_key=settings.gemini_api_key)

    history_block = ""
    if history:
        history_lines = []
        for turn in history[-6:]:  # Keep last 6 conversational turns
            role_label = "User" if turn.get("role") == "user" else "Assistant"
            history_lines.append(f"{role_label}: {turn.get('content', '')}")
        if history_lines:
            history_block = "Prior conversation context:\n" + "\n".join(history_lines) + "\n\n"

    user_prompt = (
        f"{history_block}"
        f"Question: {question}\n\n"
        f"Evidence passages:\n{format_evidence(evidence)}\n\n"
        "Provide the structured evidence-based answer now."
    )

    response = client.models.generate_content(
        model=settings.gemini_chat_model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.2,
        ),
    )

    answer = response.text or "I could not generate an evidence-grounded answer."

    citations = [
        Citation(
            document=chunk.document,
            section=chunk.section,
            page=chunk.page,
            excerpt=chunk.content[:280] + ("..." if len(chunk.content) > 280 else ""),
            source_type=getattr(chunk, "source_type", "guideline"),
        )
        for chunk in evidence
    ]

    return answer, citations


DIAGNOSTIC_SYSTEM_PROMPT = """You are LungGuide AI, an educational screening assistant.

Rules:
1. You must NOT claim to diagnose the user or say they do or do not have cancer.
2. Frame findings as: "According to these sources and guidelines..." and map them to the user's described details.
3. Use guideline evidence passages with markers [1], [2]. For web sources use markdown links [Title](URL).
4. If emergency red-flag symptoms are present, open with a clear instruction to seek emergency/urgent in-person care.
5. End with: this is educational, not a substitute for a clinician, and they should share the same details with a doctor.
6. Structure:
   ## According to these sources and guidelines
   ## How this relates to what you described
   ## Source links
   ## Important limits
"""


def generate_diagnostic_answer(
    question: str,
    conversation: str,
    evidence: list[EvidenceChunk],
    web_sources: list,
) -> tuple[str, list[Citation]]:
    from app.schemas import WebSource
    from app.services.web_search import format_web_sources

    client = genai.Client(api_key=settings.gemini_api_key)
    web_block = format_web_sources(web_sources)
    user_prompt = (
        f"Latest user message: {question}\n\n"
        f"Conversation / patient-described details:\n{conversation}\n\n"
        f"Guideline evidence passages:\n{format_evidence(evidence) or 'None retrieved.'}\n\n"
        f"Public web sources:\n{web_block}\n\n"
        "Write the educational, source-linked answer now. Include every web URL as a markdown link."
    )
    response = client.models.generate_content(
        model=settings.gemini_chat_model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=DIAGNOSTIC_SYSTEM_PROMPT,
            temperature=0.2,
        ),
    )
    answer = response.text or "I could not generate a source-grounded educational summary."

    citations = [
        Citation(
            document=chunk.document,
            section=chunk.section,
            page=chunk.page,
            excerpt=chunk.content[:280] + ("..." if len(chunk.content) > 280 else ""),
            source_type=getattr(chunk, "source_type", "guideline"),
        )
        for chunk in evidence
    ]
    for source in web_sources:
        if not isinstance(source, WebSource):
            continue
        citations.append(
            Citation(
                document=source.title,
                section="Public web source",
                page="",
                excerpt=source.snippet[:280],
                url=source.url,
                source_type="web",
            )
        )
    return answer, citations
