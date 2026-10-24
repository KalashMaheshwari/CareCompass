
import json
from pathlib import Path


DATA_FILE = Path(__file__).resolve().parent / "caregivers.json"


def match_caregivers(
    care_type: str,
    language: str = "auto",
    required_skills: list[str] | None = None
) -> list[dict]:
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        caregivers = json.load(file)

    required_role = {
        "nurse_home_visit": "nurse",
        "paramedic_home_visit": "paramedic",
    }.get(care_type)

    if required_role is None:
        return []

    results = []
    language = language.lower()
    required_skills = required_skills or []

    for caregiver in caregivers:
        if not caregiver.get("available", False):
            continue

        if caregiver.get("role") != required_role:
            continue

        caregiver_languages = [
            item.lower() for item in caregiver.get("languages", [])
        ]

        if language in ("auto", "all"):
            language_match = True
        elif language in ("hinglish", "hi", "hindi"):
            language_match = "hindi" in caregiver_languages or "english" in caregiver_languages
        elif language in ("en", "english"):
            language_match = "english" in caregiver_languages
        else:
            language_match = language in caregiver_languages

        if language != "auto" and not language_match:
            continue

        caregiver_skills = {
            skill.lower() for skill in caregiver.get("skills", [])
        }

        skill_matches = sum(
            skill.lower() in caregiver_skills
            for skill in required_skills
        )

        score = (
            skill_matches * 2
            + caregiver.get("rating", 0)
            - caregiver.get("distance_km", 100) * 0.2
        )

        results.append((score, caregiver))

    results.sort(key=lambda item: item[0], reverse=True)

    return [
        {
            "id": caregiver["id"],
            "name": caregiver["name"],
            "role": caregiver["role"],
            "languages": caregiver["languages"],
            "distance_km": caregiver["distance_km"],
            "rating": caregiver["rating"],
        }
        for _, caregiver in results[:3]
    ]
