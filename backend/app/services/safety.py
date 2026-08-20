"""Safety, scope, and refusal logic for LungGuide AI."""

from __future__ import annotations

import re

# Adversarial & Jailbreak Patterns
INJECTION_PATTERNS = [
    r"ignore (all )?(previous|prior|above) instructions",
    r"disregard (the )?(system|safety) (prompt|rules)",
    r"you are now (a )?(doctor|physician|oncologist|dan)",
    r"\byou are dan\b",
    r"dan mode",
    r"pretend (you are|to be)",
    r"jailbreak",
    r"act as (if|a|an)",
    r"bypass (safety|filters|rules)",
]

# Chemotherapy & Treatment / Prescription Patterns
TREATMENT_PRESCRIPTION_PATTERNS = [
    r"\b(chemotherapy|chemo|radiation therapy|radiotherapy|surgery|immunotherapy|targeted therapy)\b",
    r"\b(prescribe|prescription|dosage|dose|mg|pill|medication|drug regimen)\b",
    r"\b(what (chemotherapy|chemo|medication|medicine|drug) should i take)\b",
    r"\b(treatment plan for stage|cure my cancer|chemo regimen)\b",
]

# Acute Symptom & Individual Diagnostic Patterns
ACUTE_DIAGNOSTIC_PATTERNS = [
    r"\b(coughing up blood|hemoptysis|spitting blood)\b",
    r"\b(do i have cancer|diagnose me|diagnose my symptoms|is this lung cancer)\b",
    r"\b(severe chest pain|cannot breathe|sudden shortness of breath|gasping for air)\b",
    r"\b(what does my lump mean|my scan shows a tumor do i have cancer)\b",
]

# Ambiguous / Underspecified Patterns
UNDERSPECIFIED_PATTERNS = [
    r"^(am i eligible|can i get screened|should i get screened|am i a candidate)\??$",
    r"^(who|what|when|where|why|how)\??$",
    r"^(screening|lung|ldct)\??$",
    r"^(tell me more|more info|explain|help me)\.?$",
    r"^eligibility\??$",
]


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def is_prompt_injection(text: str) -> bool:
    normalized = normalize(text)
    return any(re.search(pattern, normalized) for pattern in INJECTION_PATTERNS)


def is_treatment_or_prescription(text: str) -> bool:
    normalized = normalize(text)
    return any(re.search(pattern, normalized) for pattern in TREATMENT_PRESCRIPTION_PATTERNS)


def is_acute_diagnostic(text: str) -> bool:
    normalized = normalize(text)
    return any(re.search(pattern, normalized) for pattern in ACUTE_DIAGNOSTIC_PATTERNS)


def is_ambiguous(text: str) -> bool:
    normalized = normalize(text)
    if any(re.search(pattern, normalized) for pattern in UNDERSPECIFIED_PATTERNS):
        return True
    if len(normalized) < 12 and not any(kw in normalized for kw in ["uspstf", "acs", "nlst"]):
        return True
    return False


def is_out_of_scope(text: str) -> bool:
    return is_treatment_or_prescription(text)


def check_safety_guardrails(text: str) -> tuple[bool, str | None]:
    """
    Check query against multi-tier guardrails.
    Returns: (is_blocked, refusal_reason)
    """
    if is_prompt_injection(text):
        return True, "GUARDRAIL_BLOCKED"
    if is_treatment_or_prescription(text):
        return True, "TREATMENT_PRESCRIPTION_REFUSAL"
    if is_ambiguous(text):
        return True, "CLARIFICATION_REQUIRED"
    return False, None


def build_refusal(reason: str) -> str:
    refusals = {
        "GUARDRAIL_BLOCKED": (
            "⚠️ **Security Guardrail Active**: I cannot override safety guidelines or adopt "
            "unauthorized personas. LungGuide AI operates exclusively as an evidence-grounded "
            "educational assistant for lung cancer screening guidelines."
        ),
        "TREATMENT_PRESCRIPTION_REFUSAL": (
            "🚫 **Scope Refusal (Treatment & Prescriptions)**: LungGuide AI cannot prescribe medications, "
            "recommend chemotherapy regimens, calculate drug dosages, or design cancer treatment plans. "
            "Please consult a **board-certified oncologist or your clinical care team** for individual cancer "
            "treatment and medication management."
        ),
        "INDIVIDUAL_DIAGNOSTIC_REFUSAL": (
            "🚨 **Urgent Clinical Alert (Diagnostic Refusal)**: LungGuide AI cannot diagnose individual symptoms "
            "or determine whether you have lung cancer. Symptoms like coughing up blood (hemoptysis), sudden "
            "severe shortness of breath, or unexplained chest pain require immediate evaluation. "
            "Please seek **immediate emergency or urgent diagnostic medical care** from a qualified physician."
        ),
        "CLARIFICATION_REQUIRED": (
            "📋 **Clarification Needed**: To assess screening guideline eligibility accurately, please provide "
            "the following 3 key parameters:\n"
            "1. **Age** (e.g., 55 years old)\n"
            "2. **Smoking History** in pack-years (e.g., 20 pack-years = 1 pack/day for 20 years)\n"
            "3. **Current Smoking Status** (current smoker or years since quitting)\n\n"
            "*Example: 'I am 58 years old with a 25 pack-year history and quit 8 years ago. Am I eligible?'*"
        ),
        "INSUFFICIENT_EVIDENCE": (
            "🔍 **Insufficient Evidence**: The retrieved guideline passages do not contain sufficient high-confidence "
            "evidence (hybrid relevance score below threshold τ = 0.28) to answer this question reliably. "
            "LungGuide AI will not extrapolate or hallucinate beyond verified clinical guidelines. "
            "Please try rephrasing or asking about USPSTF / ACS lung cancer screening recommendations."
        ),
        # Backward compatibility aliases
        "injection": (
            "⚠️ **Security Guardrail Active**: I cannot override safety guidelines. LungGuide AI operates "
            "exclusively as an evidence-grounded assistant for lung cancer screening guidelines."
        ),
        "out_of_scope": (
            "🚫 **Scope Refusal**: I can only provide educational information regarding lung cancer screening. "
            "I cannot provide individualized diagnosis or treatment prescriptions. Please consult a qualified doctor."
        ),
        "ambiguous": (
            "📋 **Clarification Needed**: Please specify your age, pack-years, and smoking status to assess screening eligibility."
        ),
        "insufficient_evidence": (
            "🔍 **Insufficient Evidence**: No sufficiently relevant guideline evidence was found (below threshold τ = 0.28)."
        ),
    }
    return refusals.get(reason, refusals["INSUFFICIENT_EVIDENCE"])
