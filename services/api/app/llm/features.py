"""AI features: each = facts → LLM draft → claim validator → template fallback."""

from __future__ import annotations

import re
from typing import Any

from app.llm import validator
from app.llm.provider import generate_json, provider_name

_DASH_NUM = re.compile(r"(\d)\s*[\u2013\u2014]\s*(\d)")  # en/em dash between numbers
_DASH = re.compile(r"\s*[\u2013\u2014]\s*")


def plain(text: str) -> str:
    """House style for any AI-drafted text: no em or en dashes."""
    text = _DASH_NUM.sub(r"\1 to \2", text)
    return _DASH.sub(", ", text).replace(" ,", ",")


STEP_NAMES = {
    "L0": "self-help and a re-check reminder",
    "L1": "guided self-help or community support",
    "L2": "a family physician trained in mental health, or tele-mental health",
    "L3": "a psychologist",
    "L4": "a specialist mental-health service",
    "RED": "urgent human support",
}

# ---------------------------------------------------------------- M-01 explanation


def explanation_template(facts: dict[str, Any]) -> dict[str, str]:
    scores = facts.get("scores", [])
    parts = [f"{s['instrument_name']} {s['total']} ({s['band']})" for s in scores]
    step = facts.get("step")
    if facts.get("crisis"):
        return {
            "what_this_means": "Some of your answers mean we want a person to talk with you today.",
            "what_it_does_not_mean": "This is not a diagnosis. It means you deserve support now.",
            "next_step": "A clinician will contact you. If you are in danger now, call 999.",
        }
    return {
        "what_this_means": (
            f"Your answers give these questionnaire scores: {', '.join(parts)}. "
            "They describe how often you were bothered by some feelings over the last 2 weeks."
        ),
        "what_it_does_not_mean": (
            "This is not a diagnosis, and it does not say what is wrong. A clinician looks at the whole picture."
        ),
        "next_step": (
            f"The suggested next step is {STEP_NAMES.get(step or '', 'a conversation with a clinician')}. "
            "A clinician will confirm it, and nothing is shared with your employer."
        ),
    }


def explain(facts: dict[str, Any]) -> dict[str, Any]:
    if facts.get("crisis"):
        return {
            "sections": explanation_template(facts),
            "content_type": "template",
            "provider": "none",
            "validator": {"result": "skipped", "findings": ["crisis: AI locked"]},
            "fallback_used": True,
        }
    draft = generate_json("m01_explanation.v1", facts)
    if draft:
        sections = {
            k: plain(str(draft.get(k, "")).strip())
            for k in ("what_this_means", "what_it_does_not_mean", "next_step")
        }
        text = " ".join(sections.values())
        findings = validator.check(text, facts, allow_numbers={"2"})
        if all(sections.values()) and not findings:
            return {
                "sections": sections,
                "content_type": "ai_drafted",
                "provider": provider_name(),
                "validator": {"result": "pass", "findings": []},
                "fallback_used": False,
            }
        return {
            "sections": explanation_template(facts),
            "content_type": "template",
            "provider": provider_name(),
            "validator": {"result": "fail", "findings": findings or ["empty section"]},
            "fallback_used": True,
        }
    return {
        "sections": explanation_template(facts),
        "content_type": "template",
        "provider": "none",
        "validator": {"result": "skipped", "findings": []},
        "fallback_used": True,
    }


# ---------------------------------------------------------------- Companion

_TEMPLATES = {
    "en": {
        "reply": (
            "Thank you for sharing that. It sounds like things have been heavy lately. "
            "A small step that helps many people is keeping a regular sleep and wake time this week. "
            "If you like, the 2-minute check-in can show where you are and match you to support "
            "in your language and insurance network."
        ),
        "suggestions": ["Take the 2-minute check-in", "See support options", "Talk to a person"],
        "greet": (
            "Hello, I'm Jisr Companion. I'm not a doctor, but I can listen and help you find the right "
            "support. How have you been feeling lately?"
        ),
    },
    "ar": {
        "reply": (
            "شكراً لأنك شاركتني. يبدو أن الأيام الماضية كانت ثقيلة عليك. "
            "خطوة صغيرة تساعد كثيرين هي النوم والاستيقاظ في وقت ثابت هذا الأسبوع. "
            "إذا أحببت، التقييم القصير يوضح وضعك ويقترح دعماً بلغتك وضمن تأمينك."
        ),
        "suggestions": ["ابدأ التقييم القصير", "خيارات الدعم", "أريد التحدث مع شخص"],
        "greet": "مرحباً، أنا رفيق جسر. لست طبيباً، لكن أستطيع الاستماع ومساعدتك في إيجاد الدعم المناسب. كيف حالك؟",
    },
    "ur": {
        "reply": (
            "بتانے کا شکریہ۔ لگتا ہے کہ پچھلے دن آپ پر بھاری گزرے ہیں۔ "
            "اس ہفتے سونے اور جاگنے کا ایک وقت مقرر کرنا بہت لوگوں کی مدد کرتا ہے۔ "
            "چاہیں تو دو منٹ کا چیک اِن آپ کی زبان اور انشورنس کے مطابق مدد تجویز کر سکتا ہے۔"
        ),
        "suggestions": ["دو منٹ کا چیک اِن", "مدد کے اختیارات", "کسی سے بات کریں"],
        "greet": "السلام علیکم، میں جسر کمپینین ہوں۔ میں ڈاکٹر نہیں، لیکن سن سکتا ہوں اور مدد ڈھونڈنے میں ساتھ دے سکتا ہوں۔",
    },
}

CRISIS_REPLY = {
    "en": (
        "I'm really glad you told me. I've paused the AI so a trained person can help you. "
        "If you are in danger right now, call 999. You can also call 800-SAKINA (800 725462) or "
        "800-HOPE (800 4673). A clinician has been alerted and will contact you."
    ),
    "ar": (
        "أنا ممتن لأنك أخبرتني. أوقفت المساعد الآلي حتى يساعدك شخص مدرَّب. إذا كنت في خطر الآن اتصل بـ 999. "
        "يمكنك أيضاً الاتصال بـ 800-SAKINA (800 725462) أو 800-HOPE (800 4673). تم تنبيه أحد الأطباء وسيتواصل معك."
    ),
    "ur": (
        "آپ نے بتایا، شکریہ۔ میں نے AI روک دیا ہے تاکہ تربیت یافتہ شخص آپ کی مدد کرے۔ اگر آپ ابھی خطرے میں ہیں تو 999 پر کال کریں۔ "
        "800-SAKINA (800 725462) یا 800-HOPE (800 4673) پر بھی کال کر سکتے ہیں۔ ایک معالج آپ سے رابطہ کرے گا۔"
    ),
}


def companion(messages: list[dict[str, str]], language: str) -> dict[str, Any]:
    lang = language if language in _TEMPLATES else "en"
    tpl = _TEMPLATES[lang]
    user_msgs = [m for m in messages if m.get("role") == "user" and m.get("content", "").strip()]
    if not user_msgs:
        return {
            "reply": tpl["greet"],
            "suggestions": tpl["suggestions"],
            "content_type": "template",
            "provider": "none",
            "validator": {"result": "skipped", "findings": []},
        }
    payload = {"language": lang, "conversation": messages[-10:]}
    draft = generate_json("companion.v1", payload, temperature=0.6)
    if draft and str(draft.get("reply", "")).strip():
        reply = plain(str(draft["reply"]).strip())
        findings = validator.check(
            reply, payload, allow_numbers={"2", "999", "9", "7", "800", "725462", "4673"}
        )
        if not findings:
            sugg = [plain(str(s))[:40] for s in draft.get("suggestions", [])][:3] or tpl["suggestions"]
            return {
                "reply": reply,
                "suggestions": sugg,
                "content_type": "ai_drafted",
                "provider": provider_name(),
                "validator": {"result": "pass", "findings": []},
            }
        return {
            "reply": tpl["reply"],
            "suggestions": tpl["suggestions"],
            "content_type": "template",
            "provider": provider_name(),
            "validator": {"result": "fail", "findings": findings},
        }
    return {
        "reply": tpl["reply"],
        "suggestions": tpl["suggestions"],
        "content_type": "template",
        "provider": "none",
        "validator": {"result": "skipped", "findings": []},
    }


# ---------------------------------------------------------------- Hand-off summary with provenance


def handoff_template(facts: list[dict[str, str]]) -> list[dict[str, Any]]:
    by = {f["label"]: f for f in facts}
    out = []

    def add(text: str, *labels: str) -> None:
        ids = [by[lbl]["id"] for lbl in labels if lbl in by]
        if ids:
            out.append({"text": text, "sources": ids})

    scores = [f for f in facts if f["label"] in ("PHQ-9 total", "GAD-7 total")]
    if scores:
        out.append(
            {
                "text": "Screening results: " + "; ".join(f"{f['label']} {f['value']}" for f in scores) + ".",
                "sources": [f["id"] for f in scores],
            }
        )
    if "Crisis Gate" in by:
        add(f"Crisis Gate status: {by['Crisis Gate']['value']}.", "Crisis Gate")
    if "Suggested step" in by:
        add(
            f"Rules engine suggests {by['Suggested step']['value']}, pending clinician confirmation.",
            "Suggested step",
        )
    if "Physical context" in by:
        add(f"Consented physical-health context: {by['Physical context']['value']}.", "Physical context")
    if "Preferences" in by:
        add(f"Preferences: {by['Preferences']['value']}.", "Preferences")
    if "Request" in by:
        add(f"Request: {by['Request']['value']}.", "Request")
    return out


def _validate_sentence(
    sentence: dict[str, Any], facts_by_id: dict[str, dict[str, str]]
) -> tuple[str, list[str]]:
    srcs = [s for s in sentence.get("sources", []) if s in facts_by_id]
    if not srcs:
        return "removed", ["no valid source cited"]
    cited = [facts_by_id[s] for s in srcs]
    findings = validator.check(sentence.get("text", ""), cited)
    # Proper nouns / names must appear in cited facts
    for name in re.findall(r"\bDr\.? [A-Z][a-z]+\b", sentence.get("text", "")):
        if name not in validator.facts_text(cited):
            findings.append(f"unsupported name '{name}'")
    return ("removed", findings) if findings else ("verified", [])


def handoff(facts: list[dict[str, str]]) -> dict[str, Any]:
    facts_by_id = {f["id"]: f for f in facts}
    draft = generate_json("handoff_summary.v1", {"facts": facts}, temperature=0.2)
    content_type, prov = "template", "none"
    raw: list[dict[str, Any]]
    if draft and isinstance(draft.get("sentences"), list) and draft["sentences"]:
        raw = [
            {**s, "text": plain(str(s.get("text", "")))} for s in draft["sentences"] if isinstance(s, dict)
        ]
        content_type, prov = "ai_drafted", provider_name()
    else:
        raw = handoff_template(facts)
    sentences, all_findings = [], []
    for s in raw:
        status, findings = _validate_sentence(s, facts_by_id)
        sentences.append(
            {
                "text": str(s.get("text", "")),
                "sources": [x for x in s.get("sources", []) if x in facts_by_id],
                "status": status,
                "reason": "; ".join(findings) or None,
            }
        )
        all_findings += findings
    removed = sum(1 for s in sentences if s["status"] == "removed")
    return {
        "sentences": sentences,
        "removed_count": removed,
        "validator": {"result": "pass" if removed == 0 else "fail", "findings": all_findings},
        "content_type": content_type,
        "provider": prov,
    }


# ---------------------------------------------------------------- Programme copilot narration


_WORKPLACE = re.compile(
    r"\b(workers?|workforce|staff|employees?|employers?|candidates?|applicants?|hiring|recruit\w*|onboarding)\b",
    re.I,
)


def narrate(question: str, data: dict[str, Any], template_answer: str) -> dict[str, Any]:
    draft = generate_json("programme_copilot.v1", {"question": question, "data": data}, temperature=0.3)
    if draft and str(draft.get("answer", "")).strip():
        ans = plain(str(draft["answer"]).strip())
        findings = validator.check(ans, data, allow_numbers={"10"})
        # The cohort is people who screened positive; reject invented occupations or workplace framing.
        if _WORKPLACE.search(ans):
            findings.append("invented group description (occupation or workplace)")
        if not findings:
            return {
                "answer": ans,
                "content_type": "ai_drafted",
                "provider": provider_name(),
                "validator": {"result": "pass", "findings": []},
            }
        return {
            "answer": template_answer,
            "content_type": "template",
            "provider": provider_name(),
            "validator": {"result": "fail", "findings": findings},
        }
    return {
        "answer": template_answer,
        "content_type": "template",
        "provider": "none",
        "validator": {"result": "skipped", "findings": []},
    }
