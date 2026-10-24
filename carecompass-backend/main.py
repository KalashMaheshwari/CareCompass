
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from groq import Groq

import json
import os
from pathlib import Path


# Import your supporting modules
from prompts import SYSTEM_PROMPT
from safety import detect_emergency
from matching import match_caregivers


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

load_dotenv(PROJECT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

GROQ_API_KEY = os.getenv("groq")
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)

OUTPUT_DIR = PROJECT_DIR / "outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="CareCompass Backend",
    description=(
        "AI-assisted care navigation, follow-up assessment, "
        "emergency escalation, and caregiver matching."
    ),
    version="1.0.0",
)


# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class ConversationMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=4000)


class SymptomRequest(BaseModel):
    user_input: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="Symptoms in English, Hindi, or Hinglish",
    )

    language: str = "auto"

    conversation_history: list[ConversationMessage] = Field(
        default_factory=list
    )

    location: str | None = None


# --------------------------------------------------
# SAVE ASSESSMENT OUTPUT
# --------------------------------------------------

def save_assessment(result: dict) -> None:
    output_file = OUTPUT_DIR / "last_assessment.json"
    temporary_file = OUTPUT_DIR / "last_assessment.tmp"

    with open(temporary_file, "w", encoding="utf-8") as file:
        json.dump(
            result,
            file,
            ensure_ascii=False,
            indent=2,
        )

    temporary_file.replace(output_file)


# --------------------------------------------------
# STANDARD EMERGENCY RESPONSE
# --------------------------------------------------

def emergency_response(reason: str) -> dict:
    return {
        "status": "recommendation",
        "follow_up_question": None,
        "options": [],
        "describe_placeholder": None,
        "care_type": "emergency_referral",
        "urgency": "immediate",
        "red_flags": [reason],
        "reasoning": (
            "The information may indicate a medical emergency. "
            "This is a precautionary response, not a diagnosis."
        ),
        "next_steps": [
            "Contact local emergency services immediately if "
            "someone may be in danger.",
            "In India, call 112 for emergency assistance.",
            "Do not wait for AI assessment or caregiver matching."
        ],
        "caregivers": [],
    }


MAX_FOLLOW_UP_QUESTIONS = 10
DEFAULT_OTHER_OPTION = "Elaborate"
DEFAULT_OTHER_PLACEHOLDER = "Describe your symptoms here..."


def count_follow_up_questions(history):
    """Count assistant turns that contain a follow-up question."""
    count = 0
    for turn in history:
        if turn.role == "assistant":
            content = turn.content or ""
            if "?" in content or "؟" in content or "？" in content:
                count += 1
    return count


def normalize_follow_up_options(options):
    """Return concise options and always place the free-text choice last."""
    if not isinstance(options, list):
        options = []

    cleaned = []
    other_labels = {
        "other", "other (please describe)", "other (please specify)"
    }
    for option in options:
        if isinstance(option, str) and option.strip():
            value = option.strip()
            if value.lower() not in other_labels and value not in cleaned:
                cleaned.append(value)

    return cleaned[:4] + [DEFAULT_OTHER_OPTION]


# --------------------------------------------------
# API ROUTES
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "CareCompass backend is running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# --------------------------------------------------
# MAIN ASSESSMENT WORKFLOW
# --------------------------------------------------

@app.post("/api/assess")
def assess_symptoms(request: SymptomRequest):

    message = request.user_input.strip()

    print("\nCareCompass assessment started")
    print("Language:", request.language)
    print("Patient input received")

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter the patient's symptoms.",
        )

    # Keep user turns for emergency screening.
    # Do not screen assistant-generated text as patient symptoms.
    previous_user_messages = [
        turn.content
        for turn in request.conversation_history
        if turn.role == "user"
    ]

    patient_text = " ".join(
        previous_user_messages + [message]
    )

    # --------------------------------------------------
    # STEP 1: INITIAL EMERGENCY SCREENING
    # --------------------------------------------------

    # This is only a basic keyword screen, not a reliable
    # clinical emergency detector. See safety.py limitations.
    if detect_emergency(patient_text):
        result = emergency_response(
            "Potential emergency symptom detected by initial screening"
        )

        save_assessment(result)
        print("Emergency screening triggered.")
        return result

    # --------------------------------------------------
    # STEP 2: CHECK GROQ CONFIGURATION
    # --------------------------------------------------

    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "GROQ_API_KEY is missing. Add it to your .env file "
                "and restart the server."
            ),
        )

    # --------------------------------------------------
    # STEP 3: PREPARE CONVERSATION FOR THE AI
    # --------------------------------------------------

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
            + """

Additional workflow rules:

1. Assess the full conversation, not just the latest message.
2. Ask one relevant follow-up question when essential information
   is missing. Do not repeat a question already answered.
3. Ask no more than ten follow-up questions in total.
4. If the concern may indicate an emergency, recommend immediate
   emergency care instead of continuing routine questioning.
5. Never diagnose, prescribe, or claim certainty you do not have.
6. Do not invent provider availability, credentials, or location.
7. Only recommend caregiver matching after enough information
   is available and no emergency pathway is indicated.
8. Match the user's language where practical.
9. Return a single valid JSON object with these exact keys:

{
  "status": "follow_up_needed",
  "follow_up_question": "Question or null",
  "options": [],
  "other_option_placeholder": null,
  "care_type": null,
  "urgency": null,
  "red_flags": [],
  "reasoning": "Brief explanation",
  "next_steps": []
}

Allowed status:
follow_up_needed, recommendation, uncertain

Allowed care_type:
paramedic_home_visit, nurse_home_visit, gp_teleconsult,
specialist_consult, emergency_referral, or null

Allowed urgency:
routine, same_day, immediate, or null

If information is insufficient, use status
follow_up_needed and provide one concise question with 2-4 concise
options. The final option must be "Other (please describe)".
When that option is selected, the frontend will send the patient's
free-text answer as the next user message. Set
other_option_placeholder to "Describe your symptoms here...".
For recommendation or uncertain responses, set options to [] and
other_option_placeholder to null.
If you cannot safely determine the appropriate pathway,
use status uncertain and explain the limitation.
"""
        }
    ]

    follow_up_count = count_follow_up_questions(request.conversation_history)
    remaining_questions = max(0, MAX_FOLLOW_UP_QUESTIONS - follow_up_count)
    messages[0]["content"] += (
        f"\n\nFollow-up questions already asked: {follow_up_count}. "
        f"Questions remaining: {remaining_questions}. "
        + (
            "Do not ask another follow-up question; return the safest appropriate recommendation or uncertainty response."
            if remaining_questions == 0
            else f"You may ask at most {remaining_questions} more follow-up question(s)."
        )
    )

    # Keep the recent conversation turns so follow-up answers
    # are available to the model.
    for turn in request.conversation_history[-8:]:
        if turn.role not in ("user", "assistant"):
            continue

        messages.append({
            "role": turn.role,
            "content": turn.content,
        })

    current_message = (
        f"Requested language: {request.language}\n"
        f"Patient's latest message: {message}\n"
        f"Location supplied by user: "
        f"{request.location or 'Not provided'}\n\n"
        "Assess this message in the context of the conversation. "
        "Return the required JSON only."
    )

    messages.append({
        "role": "user",
        "content": current_message,
    })

    # --------------------------------------------------
    # STEP 4: CALL GROQ
    # --------------------------------------------------

    try:
        client = Groq(api_key=GROQ_API_KEY)

        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.1,
            response_format={"type": "json_object"},
        )

        content = completion.choices[0].message.content

        if not content:
            raise ValueError("Groq returned an empty response.")

        result = json.loads(content)

    except Exception as error:
        print("Groq assessment error:", str(error))

        raise HTTPException(
            status_code=502,
            detail=(
                "The AI assessment could not be completed. "
                "Please retry or seek appropriate medical care."
            ),
        )

    # --------------------------------------------------
    # STEP 5: VALIDATE THE AI RESPONSE
    # --------------------------------------------------

    required_keys = [
        "status",
        "follow_up_question",
        "care_type",
        "urgency",
        "red_flags",
        "reasoning",
        "next_steps",
    ]

    if not isinstance(result, dict) or any(
        key not in result for key in required_keys
    ):
        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid response structure.",
        )

    if result.get("options") is None:
        result["options"] = []
    if not isinstance(result["options"], list):
        result["options"] = []

    allowed_statuses = {
        "follow_up_needed",
        "recommendation",
        "uncertain",
    }

    allowed_care_types = {
        "paramedic_home_visit",
        "nurse_home_visit",
        "gp_teleconsult",
        "specialist_consult",
        "emergency_referral",
    }

    allowed_urgencies = {
        "routine",
        "same_day",
        "immediate",
    }

    if result["status"] not in allowed_statuses:
        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid assessment status.",
        )

    if (
        result["care_type"] is not None
        and result["care_type"] not in allowed_care_types
    ):
        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid care type.",
        )

    if (
        result["urgency"] is not None
        and result["urgency"] not in allowed_urgencies
    ):
        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid urgency.",
        )

    if not isinstance(result["red_flags"], list):
        raise HTTPException(
            status_code=502,
            detail="The AI returned invalid red_flags.",
        )

    if not isinstance(result["next_steps"], list):
        raise HTTPException(
            status_code=502,
            detail="The AI returned invalid next_steps.",
        )

    # --------------------------------------------------
    # STEP 6: HANDLE EMERGENCY RECOMMENDATIONS
    # --------------------------------------------------

    if (
        result["care_type"] == "emergency_referral"
        or result["urgency"] == "immediate"
        or len(result["red_flags"]) > 0
    ):
        result["status"] = "recommendation"
        result["care_type"] = "emergency_referral"
        result["urgency"] = "immediate"
        result["follow_up_question"] = None
        result["options"] = []
        result["other_option_placeholder"] = None
        result["next_steps"] = [
            "Contact local emergency services immediately "
            "if an emergency may be occurring.",
            "In India, call 112 for emergency assistance.",
            "Do not wait for caregiver matching.",
        ]
        result["caregivers"] = []

        save_assessment(result)
        print("AI emergency pathway selected.")
        return result


    # --------------------------------------------------
    # STEP 7: ENFORCE FOLLOW-UP LIMIT AND NORMALIZE OPTIONS
    # --------------------------------------------------

    if result["status"] == "follow_up_needed":
        if follow_up_count >= MAX_FOLLOW_UP_QUESTIONS:
            # Never invent a diagnosis just because the question limit was reached.
            result["status"] = "uncertain"
            result["follow_up_question"] = None
            result["options"] = []
            result["other_option_placeholder"] = None
            result["reasoning"] = (
                "The follow-up question limit has been reached. "
                "There is not enough information to safely determine a care pathway."
            )
            result["next_steps"] = result.get("next_steps") or [
                "Contact a qualified healthcare professional for an assessment.",
                "Seek urgent help if symptoms worsen or you feel unsafe.",
            ]
        else:
            if not isinstance(result.get("follow_up_question"), str) or not result["follow_up_question"].strip():
                result["status"] = "uncertain"
                result["follow_up_question"] = None
                result["options"] = []
                result["other_option_placeholder"] = None
            else:
                result["options"] = normalize_follow_up_options(result.get("options"))
                result["other_option_placeholder"] = DEFAULT_OTHER_PLACEHOLDER
    else:
        result["follow_up_question"] = None
        result["options"] = []
        result["other_option_placeholder"] = None

    # --------------------------------------------------
    # STEP 8: MATCH CAREGIVERS ONLY WHEN APPROPRIATE
    # --------------------------------------------------

    result["caregivers"] = []

    if result["status"] == "recommendation":
        care_type = result["care_type"]
        if care_type in {"nurse_home_visit", "paramedic_home_visit"}:
            result["caregivers"] = match_caregivers(
                care_type=care_type,
                language=request.language,
            )

    # Follow-up questions and uncertain assessments do not trigger matching.
    if result["status"] in {"follow_up_needed", "uncertain"}:
        result["caregivers"] = []

    # --------------------------------------------------
    # STEP 9: SAVE AND RETURN JSON
    # --------------------------------------------------

    save_assessment(result)
    print("Assessment completed:", result["status"])
    return result
