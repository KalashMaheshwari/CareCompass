
import re


EMERGENCY_PATTERNS = [
    r"\bchest pain\b",
    r"\bchest pressure\b",
    r"\bdifficulty breathing\b",
    r"\bshortness of breath\b",
    r"\bcan't breathe\b",
    r"\bcannot breathe\b",
    r"\bunconscious\b",
    r"\bunresponsive\b",
    r"\bsevere bleeding\b",
    r"\bstroke symptoms\b",
    r"\bface drooping\b",
    r"\bslurred speech\b",
    r"\bseizure\b",
    r"\boverdose\b",
    r"\bpoisoning\b",
    r"\bsevere allergic reaction\b",
    r"\bkill myself\b",
    r"\bsuicide attempt\b",
    # Acute crisis / Severe disease indicators (e.g. AIDS crisis)
    r"\b(aids|hiv\s+crisis|acute\s+hiv)\b",
    # Hindi / Hinglish emergency red flags
    r"saans\s+nahi\s+aa\s+rahi",
    r"saans\s+mein\s+bahut\s+dikkat",
    r"dam\s+ghut",
    r"chhati\s+mein\s+(tez\s+)?dard",
    r"seene\s+mein\s+dard",
    r"behosh",
    r"khoon\s+ki\s+ulti",
    r"lakhwa",
    r"khudkhushi",
]

NEGATION_PATTERNS = [
    r"no\s+chest\s+pain",
    r"no\s+breathing\s+difficulty",
    r"breathing\s+is\s+fine",
    r"saans\s+(mein\s+)?(koi\s+)?(dikkat|problem)\s+nahi",
    r"saans\s+theek",
    r"chhati\s+mein\s+dard\s+nahi",
    r"behosh\s+nahi",
    r"khoon\s+nahi",
    r"no\s+stroke",
    r"no\s+bleeding",
    r"aids\s+nahi",
    r"no\s+aids",
    r"hiv\s+negative",
]


def detect_emergency(text: str) -> bool:
    normalized = re.sub(r"\s+", " ", text.lower()).strip()
    if not normalized:
        return False

    for pattern in EMERGENCY_PATTERNS:
        match = re.search(pattern, normalized)
        if match:
            # Check if there is an explicit negation covering this symptom
            is_negated = any(re.search(neg, normalized) for neg in NEGATION_PATTERNS)
            if not is_negated:
                return True

    return False

