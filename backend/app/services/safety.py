"""Safety, scope, and refusal logic for LungGuide AI."""

from __future__ import annotations

import re

# Adversarial & Jailbreak Patterns (English & Arabic)
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
    # Arabic injection patterns
    r"تجاهل (كل |جميع )?(التعليمات|الأوامر|إرشادات الأمان)",
    r"تجاوز (قواعد|فلاتر|إرشادات) (الأمان|السلامة)",
    r"أنت الآن (طبيب|دكتور|أخصائي|دان)",
    r"وضع دان",
    r"جيلبريك",
    r"تظاهر (بأنك|أنك)",
    r"تصرف كأنك",
]

# Chemotherapy & Treatment / Prescription Patterns (English & Arabic)
TREATMENT_PRESCRIPTION_PATTERNS = [
    r"\b(chemotherapy|chemo|radiation therapy|radiotherapy|surgery|immunotherapy|targeted therapy)\b",
    r"\b(prescribe|prescription|dosage|dose|mg|pill|medication|drug regimen)\b",
    r"\b(what (chemotherapy|chemo|medication|medicine|drug) should i take)\b",
    r"\b(treatment plan for stage|cure my cancer|chemo regimen)\b",
    # Arabic treatment / prescription patterns
    r"(علاج كيماوي|العلاج الكيماوي|كيماوي|العلاج الإشعاعي|إشعاعي|جراحة سرطان|علاج مناعي|علاج موجه)",
    r"(جرعة|جرعات|وصفة طبية|روشتة|دواء|أدوية|عقاقير|حبوب|بروتوكول علاج)",
    r"(ما هو (العلاج الكيماوي|الدواء) الذي يجب أن (آخذه|أتناوله)|اكتب لي (علاج|دواء|جرعة))",
    r"(خطة علاج لسرطان|علاج المرحلة|كيف أعالج السرطان)",
]

# Acute Symptom & Individual Diagnostic Patterns (English & Arabic)
ACUTE_DIAGNOSTIC_PATTERNS = [
    r"\b(coughing up blood|hemoptysis|spitting blood)\b",
    r"\b(do i have cancer|diagnose me|diagnose my symptoms|is this lung cancer)\b",
    r"\b(severe chest pain|cannot breathe|sudden shortness of breath|gasping for air)\b",
    r"\b(what does my lump mean|my scan shows a tumor do i have cancer)\b",
    # Arabic acute diagnostic patterns
    r"(سعال دموي|بصاق دم|كحة دم|أبصق دم|نزول دم مع (الكحة|السعال)|دم في البلغم)",
    r"(هل أنا مصاب بالسرطان|شخص حالتي|شخص أعراضي|هل لدي سرطان الرئة|هل هذا سرطان)",
    r"(ألم شديد في الصدر|لا أستطيع التنفس|ضيق تنفس مفاجئ|اختناق|صعوبة شديدة في التنفس)",
    r"(ماذا تعني الكتلة|لدي ورم هل هو سرطان)",
]

# Ambiguous / Underspecified Patterns (English & Arabic)
UNDERSPECIFIED_PATTERNS = [
    r"^(am i eligible|can i get screened|should i get screened|am i a candidate)[?؟]?$",
    r"^(who|what|when|where|why|how)[?؟]?$",
    r"^(screening|lung|ldct)[?؟]?$",
    r"^(tell me more|more info|explain|help me)[\.?؟]?$",
    r"^eligibility[?؟]?$",
    # Arabic ambiguous patterns
    r"^(هل أنا مؤهل|هل يمكنني الفحص|هل يجب أن أخضع للفحص|هل يناسبني الفحص)[?؟]?$",
    r"^(من|ماذا|متى|أين|لماذا|كيف)[?؟]?$",
    r"^(فحص|الرئة|فحص مبكر|أشعة مقطعية|فحص الرئة)[?؟]?$",
    r"^(أخبرني المزيد|معلومات أكثر|اشرح لي|ساعدني)[\.?؟]?$",
    r"^(الأهلية|معايير الفحص|شروط الفحص)[?؟]?$",
]


def is_arabic(text: str) -> bool:
    """Check if the given text contains Arabic characters."""
    return bool(re.search(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]", text))


def detect_language(question: str, history: list[dict] | None = None) -> str:
    """
    Detect whether to respond in Arabic ('ar') or English ('en').
    Prioritizes the current user question. If the current question has no clear
    alphabetical signals (e.g., pure numbers or symbols), checks recent user turns in history.
    Never checks assistant turns to avoid getting stuck in a previous language.
    """
    # 1. If the current question contains Arabic text, use Arabic
    if is_arabic(question):
        return "ar"

    # 2. If the current question contains Latin alphabet / English text, use English
    if re.search(r"[a-zA-Z]", question):
        return "en"

    # 3. If the question is numeric or neutral (e.g. "55", "10", "??"), inspect recent USER messages only
    if history:
        for turn in reversed(history):
            if turn.get("role") == "user":
                content = str(turn.get("content", ""))
                if is_arabic(content):
                    return "ar"
                if re.search(r"[a-zA-Z]", content):
                    return "en"

    return "en"


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
    if len(normalized) < 12 and not any(kw in normalized for kw in ["uspstf", "acs", "nlst", "فحص", "سرطان"]):
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


def build_refusal(reason: str, lang: str = "en") -> str:
    if lang == "ar":
        refusals_ar = {
            "GUARDRAIL_BLOCKED": (
                "⚠️ **إجراء أمني نشط**: لا يمكنني تجاوز إرشادات الأمان أو انتحال شخصيات غير مصرح بها. "
                "يعمل LungGuide AI حصرياً كمساعد تعليمي مبني على الأدلة السريرية لإرشادات فحص سرطان الرئة."
            ),
            "TREATMENT_PRESCRIPTION_REFUSAL": (
                "🚫 **خارج نطاق الاختصاص (العلاج والوصفات الطبية)**: لا يمكن لـ LungGuide AI وصف الأدوية، "
                "أو اقتراح بروتوكولات العلاج الكيماوي، أو حساب جرعات العقاقير، أو تصميم خطط علاج السرطان. "
                "يُرجى استشارة **طبيب أورام معتمد أو فريق الرعاية السريرية الخاص بك** للحصول على خطة علاجية وإدارة الأدوية الخاصة بك."
            ),
            "INDIVIDUAL_DIAGNOSTIC_REFUSAL": (
                "🚨 **تنبيه سريري عاجل (رفض التشخيص الفردي)**: لا يمكن لـ LungGuide AI تشخيص الأعراض الفردية "
                "أو تحديد ما إذا كنت مصاباً بسرطان الرئة. الأعراض مثل سعال الدم (hemoptysis)، أو ضيق التنفس الشديد المفاجئ، "
                "أو ألم الصدر غير المبرر تتطلب تقييماً طبياً فورياً. "
                "يُرجى التوجه إلى **طوارئ المستشفى أو استشارة الطبيب فوراً**."
            ),
            "CLARIFICATION_REQUIRED": (
                "📋 **مطلوب توضيح**: لتقييم أهليتك لفحص سرطان الرئة وفقاً للإرشادات بدقة، يُرجى توضيح المعايير الثلاثة التالية:\n"
                "1. **العمر** (مثال: 55 سنة)\n"
                "2. **تاريخ التدخين** بحساب (سنة-حزمة) (مثال: 20 سنة-حزمة = علبة واحدة يومياً لمدة 20 سنة)\n"
                "3. **حالة التدخين الحالية** (مدخن حالي أو عدد السنوات منذ الإقلاع)\n\n"
                "*مثال: 'عمري 58 عاماً ولدي تاريخ تدخين 25 سنة-حزمة وتوقفت عن التدخين منذ 8 سنوات، هل أنا مؤهل للفحص؟'*"
            ),
            "INSUFFICIENT_EVIDENCE": (
                "🔍 **أدلة غير كافية**: نصوص الإرشادات السريرية المسترجعة لا تحتوي على أدلة كافية بدرجة موثوقية عالية "
                "(درجة الصلة أقل من الحد الأدنى τ = 0.28) للإجابة على هذا السؤال بشكل موثوق. "
                "لن يقوم LungGuide AI بالتخمين أو تقديم إجابات خارج الإرشادات السريرية المعتمدة. "
                "يُرجى محاولة إعادة صياغة السؤال أو السؤال حول توصيات فحص سرطان الرئة المعتمدة (USPSTF / ACS)."
            ),
            "injection": (
                "⚠️ **إجراء أمني نشط**: لا يمكنني تجاوز إرشادات الأمان. يعمل LungGuide AI كمساعد تعليمي لإرشادات الفحص فقط."
            ),
            "out_of_scope": (
                "🚫 **خارج نطاق الاختصاص**: لا يمكنني تقديم تشخيص فردي أو وصف علاجات. يُرجى استشارة طبيب مختص."
            ),
            "ambiguous": (
                "📋 **مطلوب توضيح**: يُرجى تحديد العمر وتاريخ التدخين وحالة التدخين الحالية لتقييم الأهلية."
            ),
            "insufficient_evidence": (
                "🔍 **أدلة غير كافية**: لم يتم العثور على أدلة كافية من الإرشادات السريرية (أقل من الحد الأدنى τ = 0.28)."
            ),
        }
        return refusals_ar.get(reason, refusals_ar["INSUFFICIENT_EVIDENCE"])

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

