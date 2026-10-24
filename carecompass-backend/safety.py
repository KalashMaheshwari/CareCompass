
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
]


def detect_emergency(text: str) -> bool:
    normalized = re.sub(r"\s+", " ", text.lower()).strip()

    return any(
        re.search(pattern, normalized)
        for pattern in EMERGENCY_PATTERNS
    )
