"""Symptom-intake flow: collect details, then ground an educational answer."""

from __future__ import annotations

import re

from app.services.safety import is_arabic, normalize

DIAGNOSTIC_PATTERNS = [
    r"\bdiagnos(e|is|ing)\b",
    r"\bdo i have (lung )?cancer\b",
    r"\bis this (lung )?cancer\b",
    r"\bmy symptoms?\b",
    r"\bwhat('?s| is) wrong with me\b",
    r"\bi (am|'m|have been|keep) cough",
    r"\bcough(ing)?\b",
    r"\bhemoptysis\b",
    r"\bcoughing up blood\b",
    r"\bspitting blood\b",
    r"\bshort(ness)? of breath\b",
    r"\bwheez",
    r"\bchest pain\b",
    r"\bhoarse",
    r"\bun(explained)? weight loss\b",
    r"\blump\b",
    # Arabic diagnostic patterns
    r"(تشخيص|شخصني|هل أنا مصاب|هل لدي سرطان|هل هذا سرطان)",
    r"(أعراضي|ما مشكلتي|ماذا بي|أعاني من)",
    r"(سعال|كحة|أكح|بلغم)",
    r"(سعال دموي|بصاق دم|دم مع الكحة|كحة دم)",
    r"(ضيق تنفس|صعوبة في التنفس|نهجان|صفير بالصدر)",
    r"(ألم في الصدر|وجع بالصدر|ألم الصدر)",
    r"(بحة في الصوت|فقدان وزن غير مبرر|كتلة|ورم)",
]

EMERGENCY_PATTERNS = [
    r"\b(coughing up blood|hemoptysis|spitting blood)\b",
    r"\b(severe chest pain|cannot breathe|sudden shortness of breath|gasping for air)\b",
    # Arabic emergency patterns
    r"(سعال دموي|بصاق دم|كحة دم|دم مع الكحة|أبصق دم)",
    r"(ألم شديد في الصدر|لا أستطيع التنفس|ضيق تنفس مفاجئ|اختناق|صعوبة شديدة في التنفس)",
]

CONSENT_YES = (
    r"\b(yes|yeah|yep|sure|ok|okay|please|go ahead|search|look (it )?up|web|scrape)\b",
    r"(نعم|أجل|موافق|ابحث|ابحث في الويب|أكمل|نعم ابحث|ابحث على الانترنت)",
)
CONSENT_NO = (
    r"\b(no|nope|don't|do not|skip|without (the )?web|guidelines only)\b",
    r"(لا|كلا|تخطى|بدون الويب|إرشادات فقط|فقط الدلائل|لا تبحث)",
)


def conversation_text(history: list[dict], question: str) -> str:
    parts = [str(item.get("content", "")) for item in history]
    parts.append(question)
    return normalize(" ".join(parts))


def is_diagnostic_intent(text: str) -> bool:
    normalized = normalize(text)
    return any(re.search(pattern, normalized) for pattern in DIAGNOSTIC_PATTERNS)


def is_emergency_red_flag(text: str) -> bool:
    normalized = normalize(text)
    return any(re.search(pattern, normalized) for pattern in EMERGENCY_PATTERNS)


def has_age(text: str) -> bool:
    return bool(
        re.search(r"\b([1-9][0-9])\s*(years?|yo|y/o|year[- ]old)?\b", text)
        or re.search(r"\bage\b.{0,12}\d", text)
        or re.search(r"(عمري\s*\d+|\d+\s*(سنة|سنوات|عام|عاما)|السن\s*\d+)", text)
    )


def has_smoking(text: str) -> bool:
    return bool(
        re.search(r"\b(smok|pack[- ]?year|quit|never smoked|non[- ]smoker|former smoker)\b", text)
        or re.search(r"(تدخين|مدخن|أدخن|علبة|باكيت|سنة-حزمة|توقفت عن التدخين|أقلعت|غير مدخن|لم أدخن)", text)
    )


def has_duration(text: str) -> bool:
    return bool(
        re.search(
            r"\b(\d+\s*(day|days|week|weeks|month|months|year|years)|for (a )?(few|several)|since|chronic)\b",
            text,
        )
        or re.search(r"(منذ\s*\d+\s*(يوم|أيام|أسبوع|أسابيع|شهر|أشهر|شهور|سنة|سنوات)|منذ فترة|منذ عدة|مستمر منذ|مزمن)", text)
    )


def missing_intake_fields(text: str, lang: str = "en") -> list[str]:
    missing: list[str] = []
    if lang == "ar":
        if not has_age(text):
            missing.append("العمر (مثال: 55 سنة)")
        if not has_smoking(text):
            missing.append("تاريخ التدخين (مدخن حالي / سابق / لم يدخن أبداً، وسنوات-الحزمة إن وُجدت)")
        if not has_duration(text):
            missing.append("مدة استمرار العرض (مثال: منذ 3 أسابيع)")
        return missing

    if not has_age(text):
        missing.append("age")
    if not has_smoking(text):
        missing.append("smoking history (current / former / never, and pack-years if known)")
    if not has_duration(text):
        missing.append("how long the symptom has lasted")
    return missing


def web_consent_state(history: list[dict], question: str) -> str:
    """Return yes, no, or unknown from the latest user turns after a web-search ask."""
    asked = False
    for item in history:
        content = str(item.get("content", "")).lower()
        role = item.get("role")
        if role == "assistant" and ("search the web" in content or "البحث في الويب" in content):
            asked = True
        if asked and role == "user":
            normalized = normalize(str(item.get("content", "")))
            if any(re.search(p, normalized) for p in CONSENT_NO) and not any(
                re.search(p, normalized) for p in (r"\bsearch\b", r"ابحث")
            ):
                return "no"
            if any(re.search(p, normalized) for p in CONSENT_YES):
                return "yes"
    normalized = normalize(question)
    assistant_asked = any(
        item.get("role") == "assistant"
        and ("search the web" in str(item.get("content", "")).lower() or "البحث في الويب" in str(item.get("content", "")))
        for item in history
    )
    if assistant_asked:
        if re.search(r"\b(no|nope|skip|don't|do not)\b", normalized) or re.search(r"(لا|كلا|تخطى|بدون)", normalized):
            return "no"
        if any(re.search(p, normalized) for p in CONSENT_YES):
            return "yes"
    if re.search(r"\b(search the web|look it up online|yes,? search)\b", normalized) or re.search(r"(ابحث في الويب|ابحث على الانترنت|نعم ابحث)", normalized):
        return "yes"
    return "unknown"


def build_intake_prompt(missing: list[str], emergency: bool, lang: str = "en") -> str:
    bullets = "\n".join(f"- **{item}**" for item in missing)
    if lang == "ar":
        emergency_block = ""
        if emergency:
            emergency_block = (
                "🚨 **تنبيه سريري عاجل أولاً**: سعال الدم، أو ضيق التنفس الشديد المفاجئ، أو ألم الصدر الضاغط "
                "يتطلب **رعاية طبية طارئة وفورية في المستشفى**. هذه المحادثة لا يمكن أن تحل محل ذلك.\n\n"
            )
        return (
            f"{emergency_block}"
            "## يمكنني مساعدتك في استعراض المعلومات — لا يمكنني تقديم تشخيص طبي شخصي\n"
            "يعمل LungGuide كمساعد **تعليمي**. سأقوم بمقارنة ما تصفه مع إرشادات فحص سرطان الرئة والمصادر الطبية الموثوقة. "
            "هذا **ليس** تشخيصاً طبياً لحالتك الفردية.\n\n"
            "لتوفير إجابة موثوقة ومبنية على الإرشادات، يُرجى توضيح:\n"
            f"{bullets}\n"
            "- أي أعراض أخرى مصاحبة (حمى، فقدان وزن غير مبرر، ألم صدر، سعال دموي، صفير بالصدر)\n\n"
            "*مثال: عمري 58 عاماً، أدخن علبة يومياً منذ 25 سنة، توقفت منذ 4 سنوات، وأعاني من كحة جافة منذ 3 أسابيع.*"
        )

    emergency_block = ""
    if emergency:
        emergency_block = (
            "🚨 **Urgent first**: coughing blood, sudden severe breathlessness, or crushing chest pain "
            "needs **emergency / urgent in-person care now**. This chat cannot replace that.\n\n"
        )
    return (
        f"{emergency_block}"
        "## I can help you think this through — I cannot diagnose you\n"
        "LungGuide is an **educational** assistant. I will compare what you describe with screening "
        "guidelines and, if you agree, public medical sources. That is **not** a personal diagnosis.\n\n"
        "To ground the next answer, please reply with:\n"
        f"{bullets}\n"
        "- any other symptoms (fever, weight loss, chest pain, coughing blood, wheeze)\n\n"
        "*Example: I am 58, smoked 1 pack/day for 25 years, quit 4 years ago, dry cough for 3 weeks.*"
    )


def build_web_consent_prompt(emergency: bool, lang: str = "en") -> str:
    if lang == "ar":
        emergency_block = ""
        if emergency:
            emergency_block = (
                "🚨 في حال وجود سعال دموي، أو ضيق تنفس شديد، أو ألم حاد بالصدر، "
                "يُرجى التوجه إلى **طوارئ المستشفى** فوراً.\n\n"
            )
        return (
            f"{emergency_block}"
            "شكراً لك — تتوفر الآن تفاصيل كافية للبحث في **إرشادات الفحص السريرية** في هذا المشروع.\n\n"
            "هل ترغب في أن أقوم بـ **البحث في الويب** للوصول إلى مصادر عامة إضافية (مثل توصيات USPSTF وNCI وCDC وجمعية السرطان الأمريكية) "
            "ثم الإجابة **وفقاً لتلك المصادر والإرشادات** مع روابط المصادر؟\n\n"
            "يُرجى الرد بـ **نعم، ابحث في الويب** أو **لا، الإرشادات فقط**."
        )

    emergency_block = ""
    if emergency:
        emergency_block = (
            "🚨 If you have coughing blood, sudden severe breathlessness, or crushing chest pain, "
            "seek **emergency care** first.\n\n"
        )
    return (
        f"{emergency_block}"
        "Thanks — I have enough detail to look this up against **screening guidelines** in this project.\n\n"
        "Would you like me to **search the web** for additional public sources (for example USPSTF, "
        "NCI/cancer.gov, CDC, American Cancer Society) and then answer **according to those sources "
        "and guidelines**, with links?\n\n"
        "Reply **yes, search the web** or **no, guidelines only**."
    )


def search_query_from_conversation(text: str) -> str:
    return (
        "lung related cough when to see a doctor lung cancer screening guidelines "
        "USPSTF CDC NCI " + text[:180]
    )

