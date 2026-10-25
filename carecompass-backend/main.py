from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv
from groq import Groq

import json
import os
import re
import time
import tempfile
import requests
import httpx
from pathlib import Path


# Import supporting modules
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
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY") or os.getenv("sarvam")
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

OUTPUT_DIR = PROJECT_DIR / "outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="CareCompass Backend",
    description=(
        "AI-assisted care navigation, 4-step follow-up assessment, "
        "emergency escalation, and caregiver matching."
    ),
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
# LANGUAGE AND LOCALIZATION UTILITIES
# --------------------------------------------------

MAX_FOLLOW_UP_QUESTIONS = 10
PREFERRED_FOLLOW_UP_QUESTIONS = 4

DEFAULT_OTHER_OPTIONS = {
    "hi": "अन्य विवरण",
    "hinglish": "Elaborate",
    "en": "Other (please describe)",
}

DEFAULT_OTHER_PLACEHOLDERS = {
    "hi": "अपने लक्षण यहाँ विस्तार से लिखें...",
    "hinglish": "Apne lakshan yahan likhein...",
    "en": "Describe your symptoms here...",
}

LANGUAGE_DIRECTIVES = {
    "hi": """
CRITICAL LANGUAGE DIRECTIVE - HINDI (हिन्दी - देवनागरी लिपि):
The user's active language is HINDI. Every single user-facing text field in your JSON output MUST be in pure, natural, grammatically correct Hindi using the Devanagari script.
- `follow_up_question`: Pure Hindi (e.g., 'गले में दर्द के साथ क्या आपको बुखार या ठंड भी लग रही है?')
- `options`: Pure Hindi atomic choices (e.g., ['हाँ, हल्का बुखार है', 'निगलने में चुभन', 'कोई और लक्षण नहीं', 'अन्य विवरण'])
- `other_option_placeholder`: 'अपने लक्षण यहाँ विस्तार से लिखें...'
- `reasoning`: Pure Hindi explaining why home care is sufficient or why a doctor consult is needed.
- `next_steps`: Pure Hindi actionable steps starting with 'कदम 1:', 'कदम 2:', etc.
- `home_care`: Pure Hindi home remedies (गुनगुने नमक-पानी से गरारे, भाप, आराम, गुनगुना पानी).
- `warning_signs`: Pure Hindi warning signs ending with 'आपातकाल में 112 पर कॉल करें'.
DO NOT write English or Roman text in any user-facing field!
""",
    "hinglish": """
CRITICAL LANGUAGE DIRECTIVE - HINGLISH (Conversational Roman-script Hindi):
The user's active language is HINGLISH. Every single user-facing text field in your JSON output MUST be in natural, fluent conversational Hinglish (Hindi written in Roman English alphabet).
- `follow_up_question`: Conversational Hinglish (e.g., 'Gale mein dard ke sath kya aapko bukhar ya sharir dard bhi mehsoos ho raha hai?')
- `options`: Conversational Hinglish choices (e.g., ['Halka bukhar hai', 'Nigalte waqt dard', 'Koi aur lakshan nahi', 'Elaborate'])
- `other_option_placeholder`: 'Apne lakshan yahan likhein...'
- `reasoning`: Hinglish explanation of why home care is sufficient or when a doctor visit is needed.
- `next_steps`: Hinglish actionable steps starting with 'Step 1:', 'Step 2:', etc.
- `home_care`: Hinglish practical home remedies (gungune namak-paani se gargle/kullay, bhaap, Vicks balm, aaram).
- `warning_signs`: Hinglish red flags ending with 'Emergency mein turant 112 par call karein'.
DO NOT write full English paragraphs!
""",
    "en": """
CRITICAL LANGUAGE DIRECTIVE - ENGLISH:
The user's active language is ENGLISH. Every single user-facing text field in your JSON output MUST be in clear, empathetic, plain English.
- `follow_up_question`: Plain English (e.g., 'Along with your sore throat, are you experiencing any fever or body aches?')
- `options`: Plain English choices (e.g., ['Mild fever', 'Pain when swallowing', 'No other symptoms', 'Other (please describe)'])
- `other_option_placeholder`: 'Describe your symptoms here...'
- `reasoning`: Clear layman explanation of the care pathway and practical relief steps.
- `next_steps`: Plain English practical steps starting with 'Step 1:', 'Step 2:', etc.
- `home_care`: Practical home remedies (warm salt water gargle, steam inhalation, hydration, rest).
- `warning_signs`: Warning signs to watch for ending with calling 112 for acute emergencies.
"""
}


def resolve_language(requested_language: str, text: str) -> str:
    raw = (requested_language or "auto").lower().strip()
    if raw in ("hi", "hindi"):
        return "hi"
    if raw in ("hinglish", "roman_hindi"):
        return "hinglish"
    if raw in ("en", "english"):
        return "en"

    # Auto-detect from text
    if any("\u0900" <= char <= "\u097f" for char in text):
        return "hi"

    hinglish_markers = {
        "hai", "hoon", "kya", "nahi", "ko", "se", "mein", "aur", "dard",
        "bukhar", "karo", "raha", "rahi", "papa", "mummy", "bhai", "theek",
        "bahut", "khansi", "gale", "sar", "pet"
    }
    words = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
    if len(words.intersection(hinglish_markers)) >= 1:
        return "hinglish"

    return "en"


def count_follow_up_questions(history: list[ConversationMessage]) -> int:
    """Count assistant turns that represent an actual follow-up question."""
    count = 0
    for turn in history:
        if turn.role == "assistant":
            content = (turn.content or "").strip()
            if content:
                count += 1
    return count


def normalize_follow_up_options(options, lang: str = "en") -> list[str]:
    """Return concise options and always place the free-text choice last in the appropriate language."""
    if not isinstance(options, list):
        options = []

    cleaned = []
    other_labels = {
        "other", "other (please describe)", "other (please specify)",
        "elaborate", "अन्य विवरण", "विवरण लिखें", "aur batao", "kuch aur"
    }

    english_to_hi_options = {
        "yes": "हाँ",
        "no": "नहीं",
        "not sure": "पक्का नहीं पता",
        "mild fever": "हल्का बुखार",
        "high fever": "तेज़ बुखार",
        "body ache": "शरीर में दर्द",
        "headache": "सिरदर्द",
        "none": "कोई नहीं",
        "no other symptoms": "कोई अन्य लक्षण नहीं",
    }

    english_to_hinglish_options = {
        "yes": "Haan",
        "no": "Nahi",
        "not sure": "Pakka nahi pata",
        "mild fever": "Halka bukhar",
        "high fever": "Tez bukhar",
        "body ache": "Sharir mein dard",
        "headache": "Sar dard",
        "none": "Koi nahi",
        "no other symptoms": "Koi aur lakshan nahi",
    }

    for option in options:
        if isinstance(option, str) and option.strip():
            val = option.strip()
            lower = val.lower()
            if lower in other_labels:
                continue

            if lang == "hi" and lower in english_to_hi_options:
                val = english_to_hi_options[lower]
            elif lang == "hinglish" and lower in english_to_hinglish_options:
                val = english_to_hinglish_options[lower]

            if val not in cleaned:
                cleaned.append(val)

    other_opt = DEFAULT_OTHER_OPTIONS.get(lang, DEFAULT_OTHER_OPTIONS["en"])
    return cleaned[:4] + [other_opt]


# --------------------------------------------------
# DETERMINISTIC FALLBACK QUESTIONS FOR EXACT 4 TURNS
# --------------------------------------------------

FALLBACK_QUESTIONS = {
    "throat_cold": [
        # Turn 0 -> Asking Question #1 (Onset & Sensation)
        {
            "hi": ("गले में दर्द या खराश किस प्रकार महसूस हो रही है, और क्या बात करते समय बढ़ जाती है?", ["हल्की खराश व सूखापन", "निगलने में चुभन या दर्द", "गला छिला हुआ लगना"]),
            "hinglish": ("Gale mein dard ya kharash kis tarah feel ho rahi hai, aur kya baat karte waqt badhti hai?", ["Halki kharash aur sookha-pan", "Nigalte waqt chubhan/dard", "Gala chheela hua lagna"]),
            "en": ("What kind of pain or irritation are you feeling in your throat, and does it worsen when speaking?", ["Mild tickle & dryness", "Sharp pain when swallowing", "Raw or burning sensation"])
        },
        # Turn 1 -> Asking Question #2 (Associated Symptoms)
        {
            "hi": ("गले की परेशानी के साथ क्या आपको बुखार, ठंड लगना या शरीर में दर्द भी महसूस हो रहा है?", ["हल्का बुखार (100°F से कम)", "तेज़ बुखार और कपकपी", "शरीर में टूटन व थकान", "कोई बुखार या दर्द नहीं"]),
            "hinglish": ("Gale ke sath kya aapko bukhar, thand ya sharir mein dard bhi mehsoos ho raha hai?", ["Halka bukhar (under 100°F)", "Tez bukhar aur kapkapi", "Sharir tootna aur thakan", "Koi bukhar ya dard nahi"]),
            "en": ("Along with your throat discomfort, are you experiencing any fever, chills, or body aches?", ["Mild fever (<100°F)", "High fever with chills", "Body aches & fatigue", "No fever or pain"])
        },
        # Turn 2 -> Asking Question #3 (Functional & Swallowing Safety)
        {
            "hi": ("क्या आपको पानी, सूप या लार (थूक) निगलने में बहुत ज़्यादा कठिनाई हो रही है, या साँस ठीक है?", ["पानी आराम से पी पा रहे हैं", "निगलने में बहुत तकलीफ़ होती है", "साँस बिल्कुल ठीक है"]),
            "hinglish": ("Kya paani, soup ya thook (saliva) nigalne mein bahut zyada dikkat ho rahi hai, ya saans theek hai?", ["Paani araam se pee paa rahe hain", "Nigalne mein bohot dard hota hai", "Saans bilkul theek hai"]),
            "en": ("Are you having significant difficulty swallowing fluids or saliva, or is breathing comfortable?", ["Able to drink fluids normally", "Very painful to swallow anything", "Breathing is completely normal"])
        },
        # Turn 3 -> Asking Question #4 (Duration & Home Remedies)
        {
            "hi": ("यह तकलीफ़ कितने दिनों से है और क्या आपने गरारे, भाप या कोई घरेलू उपाय पहले से आज़माया है?", ["1-2 दिन से शुरू हुआ है", "3 से 4 दिन हो चुके हैं", "गरारे या भाप से थोड़ा आराम है", "अभी तक कोई उपाय नहीं किया"]),
            "hinglish": ("Yeh takleef kitne din se hai aur kya aapne gargle, bhaap ya koi gharelu upay pehle kiya hai?", ["1-2 din se shuru hua", "3 se 4 din ho chuke hain", "Gargle/bhaap se thoda aaram hai", "Abhi tak koi upay nahi kiya"]),
            "en": ("How many days have you had these symptoms, and have you already tried gargling, steam, or rest?", ["Started 1-2 days ago", "Lasting 3 to 4 days", "Tried gargling/steam with slight relief", "Haven't tried remedies yet"])
        }
    ],
    "fever_general": [
        # Turn 0 -> Asking Question #1
        {
            "hi": ("बुखार कितने तापमान तक पहुँचा है और क्या इसके साथ बहुत ज़्यादा कमज़ोरी महसूस हो रही है?", ["हल्का बुखार (99°-100°F)", "तेज़ बुखार (102°F से अधिक)", "काफ़ी कमज़ोरी और सुस्ती"]),
            "hinglish": ("Bukhar kitne temperature tak gaya hai aur kya iske sath bohot zyada kamzori feel ho rahi hai?", ["Halka bukhar (99°-100°F)", "Tez bukhar (102°F se zyada)", "Bohot kamzori aur susti"]),
            "en": ("How high has the fever reached, and is the patient experiencing notable weakness or exhaustion?", ["Mild fever (99°-100°F)", "High fever (>102°F)", "Noticeable weakness & fatigue"])
        },
        # Turn 1 -> Asking Question #2
        {
            "hi": ("क्या बुखार के साथ ठंड, कपकपी, सिरदर्द या उल्टी जैसा महसूस हो रहा है?", ["ठंड और कपकपी लग रही है", "तेज़ सिरदर्द है", "जी मिचलाना या उल्टी", "केवल बुखार है, कोई अन्य लक्षण नहीं"]),
            "hinglish": ("Kya bukhar ke sath thand, kapkapi, sar dard ya ulti jaisa lag raha hai?", ["Thand aur kapkapi lag rahi hai", "Tez sar dard hai", "Jee michlana ya ulti", "Sirf bukhar hai, aur kuch nahi"]),
            "en": ("Along with the fever, are there chills, shivering, headache, or nausea?", ["Chills & shivering", "Throbbing headache", "Nausea or vomiting", "Only fever, no other symptoms"])
        },
        # Turn 2 -> Asking Question #3
        {
            "hi": ("क्या मरीज़ पर्याप्त मात्रा में पानी, ओआरएस या तरल पदार्थ पी पा रहे हैं और पेशाब सामान्य आ रहा है?", ["हाँ, पानी-ओआरएस पी पा रहे हैं", "तरल पदार्थ पीने में अरुचि है", "पेशाब कम या गहरा आ रहा है"]),
            "hinglish": ("Kya patient kaafi paani, ORS ya fluids pee paa rahe hain aur urine normal aa raha hai?", ["Haan, fluids pee paa rahe hain", "Fluids peene ka mann nahi kar raha", "Urine kam ya dark aa raha hai"]),
            "en": ("Is the patient able to drink enough water, ORS, or fluids, and is urination regular?", ["Drinking fluids comfortably", "Struggling to keep fluids down", "Urine output is reduced or dark"])
        },
        # Turn 3 -> Asking Question #4
        {
            "hi": ("बुखार कितने दिनों से बना हुआ है और क्या पहले से कोई अन्य बीमारी (जैसे बीपी, शुगर) है?", ["1-2 दिन हुए हैं", "3 दिन से अधिक समय से है", "कोई पुरानी बीमारी नहीं है", "बीपी या शुगर की दवा चल रही है"]),
            "hinglish": ("Bukhar kitne din se bana hua hai aur kya pehle se koi condition (BP, sugar) hai?", ["1-2 din hue hain", "3 din se zyada ho gaye", "Koi purani bimari nahi hai", "BP ya sugar ki medicine chal rahi hai"]),
            "en": ("How many days has the fever persisted, and does the patient have any underlying health conditions?", ["Started 1-2 days ago", "Persisting more than 3 days", "No chronic conditions", "Underlying condition (BP, diabetes, etc.)"])
        }
    ]
}


def get_fallback_question(patient_text: str, turn_index: int, lang: str) -> tuple[str, list[str]]:
    """Return an intelligent atomic clinical question and choices for the current turn."""
    idx = min(max(0, turn_index), 3)
    lower = patient_text.lower()

    if any(k in lower for k in ["throat", "gala", "gale", "cough", "khansi", "cold", "jukham", "kharash", "sore"]):
        branch = FALLBACK_QUESTIONS["throat_cold"][idx]
    else:
        branch = FALLBACK_QUESTIONS["fever_general"][idx]

    q_data = branch.get(lang) or branch["en"]
    question, options = q_data
    normalized_options = normalize_follow_up_options(options, lang)
    return question, normalized_options


# --------------------------------------------------
# DETERMINISTIC PRACTICAL RECOMMENDATIONS
# --------------------------------------------------

def get_fallback_recommendation(patient_text: str, lang: str) -> dict:
    lower = patient_text.lower()
    is_throat = any(k in lower for k in ["throat", "gala", "gale", "cough", "khansi", "cold", "jukham", "kharash", "sore"])

    if lang == "hi":
        if is_throat:
            reasoning = (
                "आपके बताए गए लक्षणों के अनुसार इस समय तुरंत अस्पताल जाने की आवश्यकता नहीं है। "
                "हल्के गले के संक्रमण और खराश के लिए गुनगुने पानी के गरारे, भाप और घरेलू आराम सबसे सुरक्षित व प्रभावी इलाज हैं। "
                "यदि 2-3 दिन बाद भी आराम न मिले तो डॉक्टर से टेलीकंसल्ट करें।"
            )
            home_care = [
                "गुनगुने नमक-पानी से दिन में 3-4 बार गरारे (कुल्ले) करें।",
                "गर्म पानी की भाप (steam) लें और गले/छाती पर विक्स बाम लगाएं।",
                "खूब सारा गुनगुना पानी, अदरक-तुलसी की चाय या गरम सूप पिएं; ठंडी चीजों से परहेज करें।",
                "शरीर को पूरा आराम दें और धूल-धुएँ से दूर रहें।"
            ]
            next_steps = [
                "कदम 1: तुरंत घरेलू आराम और गुनगुने पानी के गरारे व भाप शुरू करें।",
                "कदम 2: यदि हल्का बुखार या शरीर दर्द हो तो वयस्क के लिए साधारण पैरासिटामोल (पैकेट निर्देश अनुसार) ले सकते हैं।",
                "कदम 3: अगले 48 घंटे घर पर आराम करें और देखें कि लक्षण सुधर रहे हैं या नहीं।",
                "कदम 4: यदि 3 दिन बाद भी तकलीफ़ बनी रहे तो जीपी टेलीकंसल्ट के ज़रिये डॉक्टर से सलाह लें।"
            ]
            recommended_tests = [
                {
                    "test_name": "सीबीसी (Complete Blood Count / CBC)",
                    "why_needed": "डॉक्टर यह रिपोर्ट देखकर तय करते हैं कि संक्रमण वायरल है या बैक्टीरियल (WBC स्तर की जाँच)।",
                    "sample_type": "ब्लड टेस्ट (घर पर सैंपल कलेक्शन उपलब्ध)",
                    "timing": "परामर्श से पहले या 48 घंटे बाद"
                },
                {
                    "test_name": "थ्रोट स्वैब कल्चर (Throat Swab / Strep Test)",
                    "why_needed": "गले में स्ट्रेप बैक्टीरिया की पुष्टि के लिए, जिससे डॉक्टर तय कर सकें कि एंटीबायोटिक की आवश्यकता है या नहीं।",
                    "sample_type": "गले का स्वैब (Throat Swab)",
                    "timing": "गले में अत्यधिक दर्द या सफेद पैच होने पर"
                },
                {
                    "test_name": "सीआरपी (C-Reactive Protein)",
                    "why_needed": "शरीर और गले में आंतरिक सूजन व संक्रमण की गंभीरता का सटीक स्तर मापने के लिए।",
                    "sample_type": "ब्लड टेस्ट",
                    "timing": "बुखार या तेज़ सूजन होने पर"
                }
            ]
            nurse_care_option = {
                "recommend": True,
                "title": "घर पर पर्सनल केयर नर्स (Personal Care Nurse) विज़िट बुक करें",
                "badge": "घर पर क्लिनिकल जाँच",
                "why_beneficial": "एक योग्य नर्स आपके घर आकर मरीज़ के सटीक वाइटल्स (बीपी, SpO2 ऑक्सीजन स्तर, पल्स, तापमान) की जाँच करती हैं और गले व फेफड़ों की आवाज़ (chest auscultation) सुनकर विस्तृत क्लिनिकल रिपोर्ट तैयार करती हैं जो डॉक्टर को दिखाई जा सकती है।",
                "services": [
                    "सटीक वाइटल्स रिकॉर्डिंग (SpO2 ऑक्सीजन, बीपी, तापमान, पल्स)",
                    "गले व टॉन्सिल्स की शारीरिक जाँच और फेफड़ों की आवाज़ सुनना",
                    "डॉक्टर द्वारा निर्धारित नेबुलाइज़ेशन या दवा सहायता",
                    "डॉक्टर के लिए विस्तृत क्लिनिकल रिपोर्ट तैयार करना"
                ]
            }
        else:
            reasoning = (
                "लक्षणों के आधार पर शरीर को पर्याप्त आराम और तरल पदार्थों की आवश्यकता है। "
                "इस समय घर पर ही रहकर आराम करना और देखभाल करना सबसे सुरक्षित है। "
                "यदि 3 दिन बाद भी बुखार या कमजोरी बनी रहे तो डॉक्टर से परामर्श लें।"
            )
            home_care = [
                "पर्याप्त मात्रा में गुनगुना पानी, ओआरएस या नारियल पानी पिएं।",
                "हल्का और सुपाच्य भोजन (खिचड़ी, दलिया) लें।",
                "शरीर को भरपूर आराम दें और भारी काम से बचें।"
            ]
            next_steps = [
                "कदम 1: तरल पदार्थों का सेवन बढ़ाएं और तापमान पर नज़र रखें।",
                "कदम 2: असहजता होने पर वयस्क सामान्य पैरासिटामोल (पैकेट निर्देश अनुसार) ले सकते हैं।",
                "कदम 3: 48 घंटे तक आराम करें और रिकवरी देखें।",
                "कदम 4: यदि बुखार 102°F से ऊपर रहे या न उतरे तो डॉक्टर को दिखाएं।"
            ]
            recommended_tests = [
                {
                    "test_name": "सीबीसी और प्लेटलेट काउंट (CBC & Platelet Count)",
                    "why_needed": "बुखार में प्लेटलेट्स और रक्त कोशिकाओं की निगरानी के लिए जिससे वायरल या मौसमी संक्रमण का पता चलता है।",
                    "sample_type": "ब्लड टेस्ट (घर पर सैंपल कलेक्शन उपलब्ध)",
                    "timing": "बुखार आने पर"
                },
                {
                    "test_name": "मलेरिया और डेंगू स्क्रीनिंग (Dengue NS1 / Malarial Parasite)",
                    "why_needed": "तेज़ बुखार या ठंड लगने पर डेंगू और मलेरिया संक्रमण को शुरुआत में ही पकड़ने के लिए।",
                    "sample_type": "ब्लड टेस्ट",
                    "timing": "24 घंटे से अधिक तेज़ बुखार रहने पर"
                },
                {
                    "test_name": "सीरम इलेक्ट्रोलाइट्स (Serum Electrolytes)",
                    "why_needed": "कमज़ोरी या डिहाइड्रेशन की स्थिति में शरीर में लवणों के संतुलन की जाँच के लिए।",
                    "sample_type": "ब्लड टेस्ट",
                    "timing": "सुस्ती या तरल कमी होने पर"
                }
            ]
            nurse_care_option = {
                "recommend": True,
                "title": "घर पर पर्सनल केयर नर्स (Personal Care Nurse) विज़िट बुक करें",
                "badge": "घर पर वाइटल्स व देखभाल",
                "why_beneficial": "बुखार और कमज़ोरी में मरीज़ को क्लिनिक ले जाने के बजाय नर्स घर पर ही ब्लड प्रेशर, ऑक्सीजन, तापमान और हाइड्रेशन स्तर की सटीक निगरानी कर सकती हैं।",
                "services": [
                    "निरंतर तापमान और SpO2 ऑक्सीजन निगरानी",
                    "डिहाइड्रेशन मूल्यांकन और ओरल फ्लुइड सहायता",
                    "डॉक्टर के टेलीकंसल्ट के लिए वाइटल्स चार्ट तैयार करना",
                    "आरामदायक होम-केयर मार्गदर्शन"
                ]
            }
        warning_signs = [
            "साँस लेने में अचानक बढ़ती तकलीफ़ या छाती में दबाव",
            "तेज़ बुखार (102°F से अधिक) जो 3 दिन तक न उतरे",
            "पानी या थूक निगलने में असमर्थता",
            "किसी भी गंभीर आपातकाल में तुरंत 112 पर कॉल करें"
        ]

    elif lang == "hinglish":
        if is_throat:
            reasoning = (
                "Aapke bataye gaye lakshano ke hisab se is samay turant doctor ke paas bhaagne ki zaroorat nahi hai. "
                "Gale ki kharash aur halki takleef ke liye gungune namak-paani se gargle, steam aur ghar ka aaram sabse safe aur asardaar upay hai. "
                "Agar 2-3 din baad bhi aaram na ho toh doctor se teleconsult karein."
            )
            home_care = [
                "Gungune namak-paani se din mein 3-4 baar gargle (kullay) karein.",
                "Garam paani ki bhaap (steam inhalation) lein aur gale/chest par Vicks balm lagayein.",
                "Khub sara gunguna paani, adrak-tulsi ki chai ya soup piyein; thandi cheezon se bachein.",
                "Sharir ko poora aaram dein aur dhool-mitti ya dhuen se door rahein."
            ]
            next_steps = [
                "Step 1: Turant gharelu aaram upchar shuru karein (gungune paani ke kullay aur bhaap).",
                "Step 2: Agar bukhar ya sharir dard zyada ho toh adult ke liye Paracetamol (packet nirdesh anusar) le sakte hain.",
                "Step 3: Agle 48 ghante aaram karein aur dekhein ki lakshan sudhar rahe hain ya nahi.",
                "Step 4: Agar 2-3 din baad bhi takleef bani rahe toh GP Teleconsult ke zariye doctor se salah lein."
            ]
            recommended_tests = [
                {
                    "test_name": "CBC (Complete Blood Count)",
                    "why_needed": "Doctor WBC aur lymphocyte count dekh kar confirm karte hain ki gale ka infection viral hai ya bacterial.",
                    "sample_type": "Blood Test (Home collection available)",
                    "timing": "Doctor consult se pehle ya 48h baad"
                },
                {
                    "test_name": "Throat Swab Culture / Strep Antigen Test",
                    "why_needed": "Gale mein bacterial infection (Strep throat) verify karne ke liye taaki doctor antibiotic ki zaroorat tay kar sakein.",
                    "sample_type": "Throat Swab",
                    "timing": "Gale mein zyada dard hone par"
                },
                {
                    "test_name": "CRP (C-Reactive Protein)",
                    "why_needed": "Gale aur internal tissues mein inflammation ki severity measure karne ke liye.",
                    "sample_type": "Blood Test",
                    "timing": "Fever ya swelling hone par"
                }
            ]
            nurse_care_option = {
                "recommend": True,
                "title": "Ghar par Personal Care Nurse visit book karein",
                "badge": "In-Person Clinical Assessment",
                "why_beneficial": "Ek certified nurse aapke ghar aakar patient ke accurate vitals (BP, SpO2 pulse oximeter, temperature) check karengi, gale aur chest ka physical examination karengi, aur doctor ke liye objective report taiyar karengi.",
                "services": [
                    "Full vitals check (SpO2 oxygen, BP, pulse rate, temperature)",
                    "Physical throat examination aur chest auscultation (lung sounds)",
                    "Prescribed nebulization ya medicines administration",
                    "Doctor consult ke liye comprehensive bedside report"
                ]
            }
        else:
            reasoning = (
                "Symptoms ko dekhte hue patient ko hydration aur physical rest ki zaroorat hai. "
                "Filhal ghar par rehkar care karna safe hai; doctor backup ke liye available hain. "
                "Agar 3 din baad bhi bukhar ya thakan bani rahe toh consult karein."
            )
            home_care = [
                "Khoob saara paani, ORS aur coconut water piyein.",
                "Halka khana (khichdi, soup) lein aur rest karein.",
                "Room temperature normal rakhein aur sharir ko aaram dein."
            ]
            next_steps = [
                "Step 1: Hydration maintain karein aur din mein 2-3 baar temperature note karein.",
                "Step 2: Fever discomfort ke liye Paracetamol (pack instruction ke anusar) use kar sakte hain.",
                "Step 3: 48 hours tak monitor karein.",
                "Step 4: Agar 3 din baad bhi fever rahe toh GP Teleconsult book karein."
            ]
            recommended_tests = [
                {
                    "test_name": "CBC & Platelet Count",
                    "why_needed": "Bukhar mein platelets aur blood count monitor karne ke liye taaki viral ya bacterial cause confirm ho sake.",
                    "sample_type": "Blood Test (Home collection available)",
                    "timing": "Fever aane par"
                },
                {
                    "test_name": "Dengue NS1 & Malarial Parasite (MP) Screen",
                    "why_needed": "Fever aur chills ke case mein Dengue aur Malaria early stage par rule out karne ke liye.",
                    "sample_type": "Blood Test",
                    "timing": "24h se zyada bukhar par"
                },
                {
                    "test_name": "Serum Electrolytes (Sodium, Potassium)",
                    "why_needed": "Dehydration aur weakness check karne ke liye taaki salt balance theek rahe.",
                    "sample_type": "Blood Test",
                    "timing": "Kamzori ya thakan par"
                }
            ]
            nurse_care_option = {
                "recommend": True,
                "title": "Ghar par Personal Care Nurse visit book karein",
                "badge": "Home Vitals & Comfort",
                "why_beneficial": "Patient ko clinic bheed mein le jaane ke bajaye nurse ghar par vitals, oxygen aur hydration check karke comfortable care provide karti hain.",
                "services": [
                    "Continuous temperature aur SpO2 oxygen monitoring",
                    "Hydration assessment aur fluid intake management",
                    "Teleconsult doctor ke liye vitals chart recording",
                    "Safe bedside recovery support"
                ]
            }
        warning_signs = [
            "Saans lene mein achanak badhti takleef ya chhati mein dabav",
            "Tez bukhar (102°F se zyada) jo 3 din tak na utre",
            "Paani ya thook nigalna bilkul mushkil ho jana",
            "Kisi bhi gambhir aapatkaal mein turant 112 par call karein"
        ]

    else:
        if is_throat:
            reasoning = (
                "Based on the clinical details provided, an immediate clinic visit is not required at this time. "
                "Gentle home care including warm salt-water gargles, steam inhalation, and hydration will allow the throat to recover safely. "
                "A doctor teleconsult is recommended if symptoms persist past 3 days."
            )
            home_care = [
                "Gargle with warm salt water 3-4 times daily to soothe throat inflammation.",
                "Inhale warm steam twice daily and apply menthol balm to the neck and chest.",
                "Drink plenty of warm fluids (herbal teas, warm water, broths) and avoid cold drinks.",
                "Rest your body and voice, and avoid dust and smoke exposure."
            ]
            next_steps = [
                "Step 1: Begin warm salt-water gargles and steam inhalation immediately.",
                "Step 2: For mild fever or body discomfort, adults may take common Paracetamol following package instructions.",
                "Step 3: Rest at home for the next 48 hours and monitor recovery.",
                "Step 4: If symptoms worsen or fail to improve after 3 days, book a GP teleconsult."
            ]
            recommended_tests = [
                {
                    "test_name": "Complete Blood Count (CBC)",
                    "why_needed": "Doctors evaluate WBC and lymphocyte counts to differentiate between viral and bacterial infections.",
                    "sample_type": "Blood Test (At-home collection available)",
                    "timing": "Before doctor consult or after 48h"
                },
                {
                    "test_name": "Throat Swab Culture / Rapid Strep Antigen",
                    "why_needed": "Identifies Group A Streptococcus to verify whether prescription antibiotic therapy is medically required.",
                    "sample_type": "Throat Swab",
                    "timing": "If severe throat pain or tonsil exudates occur"
                },
                {
                    "test_name": "CRP (C-Reactive Protein)",
                    "why_needed": "Measures acute internal tissue inflammation and severity of immune response.",
                    "sample_type": "Blood Test",
                    "timing": "If fever or systemic swelling occurs"
                }
            ]
            nurse_care_option = {
                "recommend": True,
                "title": "Book an In-Person Personal Care Nurse at Home",
                "badge": "In-Person Clinical Assessment",
                "why_beneficial": "A qualified registered nurse visits your home to record clinical-grade vitals (Blood Pressure, SpO2 pulse oximetry, heart rate, temperature), physically inspect throat and lung sounds, and provide an objective bedside assessment for your teleconsult doctor.",
                "services": [
                    "Comprehensive vitals check (SpO2 oxygen, BP, pulse, temperature)",
                    "Throat visual inspection & chest auscultation (lung sounds)",
                    "Doctor-prescribed nebulization or medication support",
                    "Objective bedside report shared directly with your teleconsult doctor"
                ]
            }
        else:
            reasoning = (
                "The patient's current symptoms can be managed comfortably at home with hydration and rest. "
                "Routine clinical monitoring is recommended; seek teleconsultation if symptoms do not improve in 48 to 72 hours."
            )
            home_care = [
                "Drink plenty of water, ORS solution, and clear warm fluids.",
                "Eat light, nourishing meals such as warm soup or porridge.",
                "Ensure quiet, uninterrupted physical rest."
            ]
            next_steps = [
                "Step 1: Increase fluid intake and record body temperature twice daily.",
                "Step 2: Use OTC Paracetamol as directed on packaging if body aches cause discomfort.",
                "Step 3: Allow 48 hours for immune recovery with adequate sleep.",
                "Step 4: Consult a physician if fever exceeds 102°F or persists past day 3."
            ]
            recommended_tests = [
                {
                    "test_name": "Complete Blood Count & Platelet Count",
                    "why_needed": "Monitors platelets and red/white blood cell balance to diagnose viral vs bacterial illness.",
                    "sample_type": "Blood Test (Home collection available)",
                    "timing": "On fever onset"
                },
                {
                    "test_name": "Dengue NS1 Antigen & Malarial Parasite Screen",
                    "why_needed": "Crucial early screening to rule out mosquito-borne infections in prolonged fever.",
                    "sample_type": "Blood Test",
                    "timing": "If fever exceeds 24-48 hours"
                },
                {
                    "test_name": "Serum Electrolytes (Sodium, Potassium, Chloride)",
                    "why_needed": "Doctors check electrolyte balance to screen for dehydration, exhaustion, or weakness.",
                    "sample_type": "Blood Test",
                    "timing": "If dehydrated or feeling fatigued"
                }
            ]
            nurse_care_option = {
                "recommend": True,
                "title": "Book an In-Person Personal Care Nurse at Home",
                "badge": "Home Vitals & Comfort",
                "why_beneficial": "Avoid traveling to crowded waiting rooms while feeling weak. A nurse performs bedside vitals evaluation and provides objective clinical documentation for your doctor.",
                "services": [
                    "Continuous temperature and pulse oximetry tracking",
                    "Hydration and fluid status evaluation",
                    "Clinical vitals charting for teleconsult physician review",
                    "Comfortable at-home recovery and precaution monitoring"
                ]
            }
        warning_signs = [
            "Sudden severe shortness of breath or chest tightness",
            "High fever (>102°F) lasting more than 3 consecutive days",
            "Inability to swallow fluids or stay hydrated",
            "Call 112 immediately for any life-threatening emergency"
        ]

    return {
        "reasoning": reasoning,
        "home_care": home_care,
        "next_steps": next_steps,
        "warning_signs": warning_signs,
        "recommended_tests": recommended_tests,
        "nurse_care_option": nurse_care_option,
    }


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

def emergency_response(reason: str, lang: str = "en") -> dict:
    if lang == "hi":
        return {
            "status": "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": None,
            "care_type": "emergency_referral",
            "urgency": "immediate",
            "red_flags": [reason],
            "reasoning": (
                "यह जानकारी किसी संभावित आपातकालीन स्थिति की ओर संकेत करती है। "
                "सुरक्षा के लिए तुरंत आपातकालीन सेवा से संपर्क करें।"
            ),
            "next_steps": [
                "यदि मरीज़ गंभीर संकट में है तो तुरंत आपातकालीन सहायता लें।",
                "भारत में तत्काल एम्बुलेंस सहायता के लिए 112 पर कॉल करें।",
                "एआई मूल्यांकन या डॉक्टर की बुकिंग की प्रतीक्षा न करें।"
            ],
            "home_care": ["मरीज़ को शांत रखें और आराम से लिटाएं।"],
            "warning_signs": ["साँस में भारी तकलीफ़, बेहोशी, या छाती में तेज़ दर्द।"],
            "caregivers": [],
        }
    elif lang == "hinglish":
        return {
            "status": "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": None,
            "care_type": "emergency_referral",
            "urgency": "immediate",
            "red_flags": [reason],
            "reasoning": (
                "Yeh information emergency condition ki taraf ishara kar sakti hai. "
                "Precaution ke liye turant emergency help lena zaroori hai."
            ),
            "next_steps": [
                "Agar patient ko tez takleef hai toh turant emergency service se contact karein.",
                "India mein emergency madad ke liye 112 par call karein.",
                "AI assessment ya caregiver booking ka wait bilkul na karein."
            ],
            "home_care": ["Patient ko shaant rakhein aur aaram se bithayein/litayein."],
            "warning_signs": ["Saans lene mein tez takleef, behoshi ya chest pain."],
            "caregivers": [],
        }
    else:
        return {
            "status": "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": None,
            "care_type": "emergency_referral",
            "urgency": "immediate",
            "red_flags": [reason],
            "reasoning": (
                "The information may indicate a medical emergency. "
                "This is a precautionary response, not a diagnosis."
            ),
            "next_steps": [
                "Contact local emergency services immediately if someone may be in danger.",
                "In India, call 112 for emergency assistance.",
                "Do not wait for AI assessment or caregiver matching."
            ],
            "home_care": ["Keep the patient calm and in a safe, resting position."],
            "warning_signs": ["Severe breathlessness, chest pressure, loss of consciousness."],
            "caregivers": [],
        }


# --------------------------------------------------
# DIRECT DEMAND ROUTING (APPOINTMENTS & NURSE CARE)
# --------------------------------------------------

DIRECT_APPOINTMENT_PATTERNS = [
    r"\binstant\s+appointment(s)?\b",
    r"\bbook\s+(an?\s+)?appointment\b",
    r"\burgent\s+appointment(s)?\b",
    r"\bimmediate\s+appointment(s)?\b",
    r"\bdoctor\s+appointment(s)?\b",
    r"\bneed\s+(an?\s+)?appointment\b",
    r"\bwant\s+(an?\s+)?appointment\b",
    r"\bschedule\s+(an?\s+)?appointment\b",
    r"\bget\s+(an?\s+)?appointment\b",
    r"\bteleconsult(ation)?\b",
    r"\bvideo\s+consult(ation)?\b",
    r"\bdoctor\s+consult(ation)?\b",
    r"\bconsult\s+(a\s+)?doctor\b",
    r"\bspeak\s+(with|to)\s+(a\s+)?doctor\b",
    r"\btalk\s+(with|to)\s+(a\s+)?doctor\b",
    r"\bconnect\s+(with|to)\s+(a\s+)?doctor\b",
    r"\bneed\s+(a\s+)?doctor\b",
    r"\bwant\s+(a\s+)?doctor\b",
    r"\bsee\s+(a\s+)?doctor\b",
    r"\bcall\s+(a\s+)?doctor\b",
    r"\binstant\s+consult\b",
    r"\binstant\s+doctor\b",
    r"appointment\s+chahiye",
    r"doctor\s+chahiye",
    r"doctor\s+se\s+baat",
    r"doctor\s+se\s+milna",
    r"doctor\s+dikhana",
    r"appointment\s+book\s*(karo|karna|karana|karni)?",
    r"turant\s+appointment",
    r"turant\s+doctor",
    r"doctor\s+ko\s+dikhana",
    r"डॉक्टर\s+अपॉइंटमेंट",
    r"अपॉइंटमेंट\s+चाहिए",
    r"डॉक्टर\s+चाहिए",
    r"डॉक्टर\s+से\s+बात",
]

ASSISTANCE_PATTERNS = [
    r"\bnurse\s+assistance\b",
    r"\bneed\s+assistance\b",
    r"\bassistance\s+needed\b",
    r"\bneed\s+(a\s+)?nurse\b",
    r"\bbook\s+(a\s+)?nurse\b",
    r"\bwant\s+(a\s+)?nurse\b",
    r"\bsend\s+(a\s+)?nurse\b",
    r"\bhome\s+nurse\b",
    r"\bnurse\s+at\s+home\b",
    r"\bnurse\s+visit\b",
    r"\bnurse\s+home\s+visit\b",
    r"\bnurse\s+help\b",
    r"\bnurse\s+support\b",
    r"\bcaregiver\b",
    r"\bbedridden\b",
    r"\bbedside\s+(care|assistance|monitoring)\b",
    r"\bblood\s+test\s+(chahiye|needed|karna|karwana)\b",
    r"\bneed\s+(a\s+)?blood\s+test\b",
    r"\bsample\s+collection\b",
    r"nurse\s+chahiye",
    r"nurse\s+assistance\s+chahiye",
    r"nurse\s+sahayata",
    r"nurse\s+madad",
    r"nurse\s+bhej\s+(do|dijiye)",
    r"madad\s+chahiye",
    r"sahayata\s+chahiye",
    r"ghar\s+par\s+nurse",
    r"ghar\s+par\s+dekhbhal",
    r"elderly\s+care",
    r"नर्स\s+चाहिए",
    r"नर्स\s+सहायता",
    r"घर\s+पर\s+नर्स",
]


def detect_direct_appointment_request(text: str) -> bool:
    normalized = re.sub(r"\s+", " ", text.lower()).strip()
    return any(re.search(pat, normalized) for pat in DIRECT_APPOINTMENT_PATTERNS)


def detect_direct_assistance_request(text: str) -> bool:
    normalized = re.sub(r"\s+", " ", text.lower()).strip()
    return any(re.search(pat, normalized) for pat in ASSISTANCE_PATTERNS)


def appointment_response(lang: str = "en") -> dict:
    if lang == "hi":
        return {
            "status": "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": None,
            "care_type": "gp_teleconsult",
            "urgency": "immediate",
            "red_flags": [],
            "reasoning": (
                "आपने तत्काल डॉक्टर अपॉइंटमेंट और टेलीकंसल्टेशन का अनुरोध किया है। बिना किसी इंतज़ार या अतिरिक्त प्रश्नों के, "
                "आपको तत्काल उपलब्ध प्रमाणित जनरल फिजिशियन से सीधे जोड़ा जा रहा है।"
            ),
            "next_steps": [
                "कदम 1: नीचे दिए गए सत्यापित डॉक्टरों में से तुरंत वीडियो या ऑडियो टेलीकंसल्टेशन स्लॉट चुनें।",
                "कदम 2: अपने लक्षण, तापमान व पुरानी दवाइयों/पर्चों की जानकारी तैयार रखें।",
                "कदम 3: सुरक्षित वीडियो या फ़ोन कॉल पर डॉक्टर से सीधा परामर्श लेकर क्लिनिकल सलाह और डिजिटल पर्चा प्राप्त करें।"
            ],
            "home_care": [
                "परामर्श के लिए शांत और आरामदायक कमरे में बैठें।",
                "डॉक्टर से पूछने के लिए अपने मुख्य लक्षण और सवाल एक जगह नोट कर लें।",
                "पर्याप्त मात्रा में गुनगुना पानी पिएं और आराम करें।"
            ],
            "warning_signs": [
                "अचानक छाती में दबाव या सांस लेने में भारी तकलीफ",
                "बेहोशी, भ्रम या अत्यधिक चक्कर आना",
                "किसी भी गंभीर आपातकाल में तुरंत 112 पर कॉल करें"
            ],
            "recommended_tests": [],
            "nurse_care_option": None,
            "caregivers": []
        }
    elif lang == "hinglish":
        return {
            "status": "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": None,
            "care_type": "gp_teleconsult",
            "urgency": "immediate",
            "red_flags": [],
            "reasoning": (
                "Aapne instant doctor appointment aur teleconsultation ki demand ki hai. "
                "Bina kisi follow-up delay ke, aapko directly certified general physicians aur teleconsult doctors ke sath route kar diya gaya hai."
            ),
            "next_steps": [
                "Step 1: Niche listed available doctors mein se turant instant consultation slot select karein.",
                "Step 2: Apne symptoms aur previous medicines/prescriptions ki details ready rakhein.",
                "Step 3: Secure video ya audio call par doctor se connect karke instant verified digital prescription paayein."
            ],
            "home_care": [
                "Consultation ke liye shaant aur comfortable jagah par baithein.",
                "Doctor se poochhne ke liye apne sawal note kar lein.",
                "Hydration maintain karein aur resting posture mein rahein."
            ],
            "warning_signs": [
                "Achanak seene mein tez dabav ya saans phoolna",
                "Loss of consciousness ya extreme dizziness",
                "Kisi bhi gambhir aapatkaal mein turant 112 par call karein"
            ],
            "recommended_tests": [],
            "nurse_care_option": None,
            "caregivers": []
        }
    else:
        return {
            "status": "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": None,
            "care_type": "gp_teleconsult",
            "urgency": "immediate",
            "red_flags": [],
            "reasoning": (
                "You requested an instant doctor appointment / teleconsultation. "
                "Without requiring further follow-up questions, your request has been directly routed to certified general physicians available for immediate consultation."
            ),
            "next_steps": [
                "Step 1: Select an instant video or audio consultation slot from the verified physicians below.",
                "Step 2: Keep your symptom timeline and any current medications handy.",
                "Step 3: Connect directly with the doctor to receive clinical evaluation and a digital prescription."
            ],
            "home_care": [
                "Sit in a quiet, well-lit room for your video consultation.",
                "Write down your key symptoms and questions for the doctor.",
                "Remain comfortably seated and hydrated."
            ],
            "warning_signs": [
                "Sudden crushing chest pain or severe shortness of breath",
                "Sudden weakness, confusion, or loss of consciousness",
                "Call 112 immediately for acute emergency care"
            ],
            "recommended_tests": [],
            "nurse_care_option": None,
            "caregivers": []
        }


def assistance_response(lang: str = "en") -> dict:
    if lang == "hi":
        return {
            "status": "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": None,
            "care_type": "nurse_home_visit",
            "urgency": "same_day",
            "red_flags": [],
            "reasoning": (
                "मरीज़ की देखभाल, व्यक्तिगत सहायता और वाइटल्स जाँच के लिए घर पर पर्सनल केयर नर्स विजिट सबसे उपयुक्त और सुरक्षित विकल्प है। "
                "नर्स घर आकर वाइटल्स (बीपी, ऑक्सीजन, तापमान) की जाँच करेंगी और आवश्यक देखभाल प्रदान करेंगी।"
            ),
            "next_steps": [
                "कदम 1: नीचे दिए गए विकल्पों में से अपने क्षेत्र की प्रमाणित पर्सनल केयर नर्स बुक करें।",
                "कदम 2: डॉक्टर समीक्षा के लिए आवश्यक बेसिक ब्लड टेस्ट (सीबीसी, शुगर) बुक करें।",
                "कदम 3: मरीज़ को शांत व आरामदायक स्थिति में रखें और उनकी दवाइयां तैयार रखें।",
                "कदम 4: नर्स के आने पर वाइटल्स रिकॉर्ड करवाएं और आवश्यकतानुसार डॉक्टर से सलाह लें।"
            ],
            "home_care": [
                "मरीज़ को आरामदायक स्थिति में लिटाएं या सहारा देकर बिठाएं।",
                "कमरे में ताज़ी हवा और शांति का वातावरण बनाए रखें।",
                "पर्याप्त मात्रा में गुनगुना पानी, ओआरएस या हल्का भोजन उपलब्ध कराएं।"
            ],
            "warning_signs": [
                "अचानक साँस लेने में भारी तकलीफ़ या छाती में दर्द",
                "मरीज़ का अनुत्तरदायी या बेहोश होना",
                "किसी भी गंभीर आपातकाल में तुरंत 112 पर कॉल करें"
            ],
            "recommended_tests": [
                {
                    "test_name": "Complete Blood Count (CBC)",
                    "why_needed": "इन्फेक्शन और वाइटल काउंट्स की जांच हेतु",
                    "sample_type": "Blood Test (Home Collection)",
                    "price": 299
                },
                {
                    "test_name": "Random Blood Glucose (RBS)",
                    "why_needed": "कमजोरी या चक्कर के कारण शुगर लेवल की तत्काल जांच",
                    "sample_type": "Blood Test",
                    "price": 149
                }
            ],
            "nurse_care_option": {
                "recommend": True,
                "title": "घर पर पर्सनल केयर नर्स विजिट बुक करें",
                "badge": "Bedside Vitals & Assistance",
                "why_beneficial": "क्लीनिक के चक्कर लगाने के बजाय प्रशिक्षित नर्स घर आकर मरीज़ के वाइटल्स चेक करेंगी और देखभाल में सहायता देंगी।",
                "services": [
                    "ब्लड प्रेशर, पल्स ऑक्सीमीटर और तापमान की जांच",
                    "दवा देने और आरामदायक स्थिति बनाने में सहायता",
                    "डॉक्टर टेलीकंसल्ट के लिए वाइटल्स रिपोर्ट तैयार करना"
                ],
                "price": 499
            },
            "caregivers": []
        }
    elif lang == "hinglish":
        return {
            "status": "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": None,
            "care_type": "nurse_home_visit",
            "urgency": "same_day",
            "red_flags": [],
            "reasoning": (
                "Patient ki physical assistance aur monitoring ke liye ghar par certified Personal Care Nurse book karna sabse safe aur reliable option hai. "
                "Nurse ghar aakar vitals (BP, SpO2, temp) check karengi aur bedside supportive care dengi."
            ),
            "next_steps": [
                "Step 1: Niche listed verified personal care nurse ko home visit ke liye book karein.",
                "Step 2: Doctor review ke liye basic diagnostic lab tests (CBC, Blood Sugar) schedule karein.",
                "Step 3: Patient ko comfortable resting posture mein rakhein aur hydrated rakhein.",
                "Step 4: Nurse visit ke baad bedside report ke sath teleconsult doctor se connect karein."
            ],
            "home_care": [
                "Patient ko comfortable position mein aaram karwayein.",
                "Room ko ventilated aur peaceful rakhein.",
                "Adequate water, ORS aur light meals provide karein."
            ],
            "warning_signs": [
                "Achanak saans phoolna ya chest pain",
                "Loss of consciousness ya extreme lethargy",
                "Kisi bhi gambhir aapatkaal mein turant 112 par call karein"
            ],
            "recommended_tests": [
                {
                    "test_name": "Complete Blood Count (CBC)",
                    "why_needed": "Infection aur health profile evaluate karne ke liye",
                    "sample_type": "Blood Test (Home Collection)",
                    "price": 299
                },
                {
                    "test_name": "Random Blood Glucose (RBS)",
                    "why_needed": "Weakness ke case mein blood sugar level check karne ke liye",
                    "sample_type": "Blood Test",
                    "price": 149
                }
            ],
            "nurse_care_option": {
                "recommend": True,
                "title": "Ghar par Personal Care Nurse visit book karein",
                "badge": "In-Person Bedside Assistance",
                "why_beneficial": "Clinic ke chakkar katne ke bajaye registered nurse ghar par bedside vitals monitor karengi aur assistance dengi.",
                "services": [
                    "Comprehensive vitals check (BP, SpO2, Pulse, Temp)",
                    "Bedside recovery aur medicine management support",
                    "Doctor teleconsult review ke liye vitals chart"
                ],
                "price": 499
            },
            "caregivers": []
        }
    else:
        return {
            "status": "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": None,
            "care_type": "nurse_home_visit",
            "urgency": "same_day",
            "red_flags": [],
            "reasoning": (
                "For dedicated patient assistance and physical comfort, booking a Personal Care Nurse at home is the most appropriate option. "
                "A certified nurse will record bedside clinical vitals (BP, SpO2 pulse oximetry, temperature) and provide hands-on supportive care."
            ),
            "next_steps": [
                "Step 1: Book a certified personal care nurse for a home visit from the nearby responders below.",
                "Step 2: Schedule home sample collection for baseline diagnostic tests (CBC, Blood Sugar).",
                "Step 3: Ensure the patient is resting comfortably and well-hydrated.",
                "Step 4: Use the bedside vitals recorded by the nurse for physician teleconsultation."
            ],
            "home_care": [
                "Keep the patient in a comfortable, supported resting position.",
                "Maintain a calm, well-ventilated recovery environment.",
                "Offer warm fluids, water, or ORS in small sips."
            ],
            "warning_signs": [
                "Sudden severe shortness of breath or chest pain",
                "Confusion, severe dizziness, or loss of responsiveness",
                "Call 112 immediately for any acute medical emergency"
            ],
            "recommended_tests": [
                {
                    "test_name": "Complete Blood Count (CBC)",
                    "why_needed": "Evaluates overall health and immune cell counts",
                    "sample_type": "Blood Test (Home collection available)",
                    "price": 299
                },
                {
                    "test_name": "Random Blood Glucose (RBS)",
                    "why_needed": "Screening for blood sugar dips causing fatigue or weakness",
                    "sample_type": "Blood Test",
                    "price": 149
                }
            ],
            "nurse_care_option": {
                "recommend": True,
                "title": "Book an In-Person Personal Care Nurse at Home",
                "badge": "In-Person Clinical Assessment",
                "why_beneficial": "Avoid traveling to clinic waiting rooms. A qualified nurse provides bedside vitals evaluation and direct care assistance.",
                "services": [
                    "Comprehensive vitals check (SpO2 oxygen, BP, pulse, temperature)",
                    "Bedside patient positioning and comfort management",
                    "Objective vitals report for teleconsult physician review"
                ],
                "price": 499
            },
            "caregivers": []
        }


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


SARVAM_URL = "https://api.sarvam.ai/speech-to-text"
MAX_BYTES = 5 * 1024 * 1024  # 5MB limit for short clips

# App language -> (Sarvam language_code, mode)
SARVAM_LANG_MAP = {
    "en":       ("en-IN", "transcribe"),
    "hi":       ("hi-IN", "transcribe"),
    "hinglish": ("hi-IN", "codemix"),
    "auto":     ("unknown", "transcribe"),
}

@app.post("/stt")
async def stt(
    audio: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    language: str = Form("auto")
):
    """
    Sarvam AI Speech-to-Text (saaras:v3) endpoint with Whisper fallback.
    Accepts either 'audio' or 'file' multipart parameter for maximum compatibility.
    """
    upload = audio or file
    if not upload:
        raise HTTPException(400, "No audio file provided")

    data = await upload.read()
    if not data:
        raise HTTPException(400, "empty_audio")
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "audio_too_large")

    key = os.environ.get("SARVAM_API_KEY") or SARVAM_API_KEY
    lang_key = (language or "auto").lower().strip()
    code, mode = SARVAM_LANG_MAP.get(lang_key, SARVAM_LANG_MAP["auto"])
    raw_content_type = (upload.content_type or "audio/webm").split(";")[0].strip()
    # Normalize mime-types accepted by Sarvam API
    content_type = "audio/webm" if "webm" in raw_content_type else ("audio/mp4" if "mp4" in raw_content_type or "m4a" in raw_content_type else "audio/wav")
    filename = upload.filename or ("speech.m4a" if "mp4" in content_type else "speech.webm")

    # 1. Primary: Sarvam AI STT
    if key:
        try:
            async with httpx.AsyncClient(timeout=20.0) as http_client:
                r = await http_client.post(
                    SARVAM_URL,
                    headers={"api-subscription-key": key},
                    data={"model": "saaras:v3", "language_code": code, "mode": mode},
                    files={"file": (filename, data, content_type)},
                )
            if r.status_code == 200:
                j = r.json()
                transcript = (j.get("transcript") or "").strip()
                detected_lang = j.get("language_code") or code
                safe_log = transcript[:80].encode("ascii", errors="replace").decode("ascii")
                print(f"[Sarvam STT saaras:v3] Transcribed ({detected_lang}): {safe_log}")
                return {
                    "transcript": transcript,
                    "text": transcript,
                    "language": detected_lang,
                    "engine": "sarvam",
                    "success": True
                }
            else:
                safe_err = r.text[:200].encode("ascii", errors="replace").decode("ascii")
                print(f"[Sarvam STT Warning] HTTP {r.status_code}: {safe_err}. Trying Whisper...")
        except httpx.HTTPError as he:
            print(f"[Sarvam STT Network Error] {he}. Trying Whisper fallback...")

    # 2. Failover: Groq Whisper
    if GROQ_API_KEY and client:
        try:
            suffix = Path(filename).suffix or ".webm"
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            try:
                temp_file.write(data)
                temp_file.flush()
                temp_path = temp_file.name
            finally:
                temp_file.close()

            try:
                whisper_lang = "hi" if lang_key in ("hi", "hinglish") else ("en" if lang_key == "en" else None)
                with open(temp_path, "rb") as af:
                    transcription = client.audio.transcriptions.create(
                        model="whisper-large-v3-turbo",
                        file=af,
                        language=whisper_lang,
                        response_format="json"
                    )
                transcript = transcription.text.strip() if hasattr(transcription, "text") else str(transcription).strip()
                safe_log = transcript[:80].encode("ascii", errors="replace").decode("ascii")
                print(f"[Whisper STT Fallback] Transcribed: {safe_log}")
                return {
                    "transcript": transcript,
                    "text": transcript,
                    "language": whisper_lang or "auto",
                    "engine": "whisper",
                    "success": True
                }
            finally:
                if os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception:
                        pass
        except Exception as we:
            print(f"[Whisper Fallback Error] {we}")

    if not key and not GROQ_API_KEY:
        raise HTTPException(500, "stt_not_configured")

    raise HTTPException(502, "stt_failed")


@app.post("/api/transcribe")
async def transcribe_alias(
    audio: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    language: str = Form("auto")
):
    return await stt(audio=audio, file=file, language=language)


# --------------------------------------------------
# MAIN ASSESSMENT WORKFLOW
# --------------------------------------------------

@app.post("/api/assess")
def assess_symptoms(request: SymptomRequest):
    message = request.user_input.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter the patient's symptoms.",
        )

    # 1. Determine active language
    previous_user_messages = [
        turn.content
        for turn in request.conversation_history
        if turn.role == "user"
    ]
    patient_text = " ".join(previous_user_messages + [message])
    lang = resolve_language(request.language, patient_text)

    follow_up_count = count_follow_up_questions(request.conversation_history)
    current_question_number = follow_up_count + 1

    print("\n[CareCompass Assessment]")
    print(f"Language: {lang} (Requested: {request.language})")
    print(f"Follow-up progress: Question #{current_question_number} of {MAX_FOLLOW_UP_QUESTIONS} (Answered: {follow_up_count})")

    # 2. Safety Screen
    if detect_emergency(patient_text):
        result = emergency_response(
            "Potential emergency symptom detected by safety screening",
            lang=lang,
        )
        save_assessment(result)
        print("Safety screen triggered: Emergency referral dispatched.")
        return result

    # 3. Direct Service Demand Screens (Instant Appointments & Nurse Assistance - ZERO Follow-ups)
    if detect_direct_appointment_request(patient_text):
        result = appointment_response(lang=lang)
        result["caregivers"] = match_caregivers(
            care_type="gp_teleconsult",
            language=lang,
        )
        save_assessment(result)
        print("Direct appointment request triggered: Instant GP teleconsult dispatched immediately without follow-up questions.")
        return result

    if detect_direct_assistance_request(patient_text):
        result = assistance_response(lang=lang)
        result["caregivers"] = match_caregivers(
            care_type="nurse_home_visit",
            language=lang,
        )
        save_assessment(result)
        print("Direct assistance request triggered: Nurse home visit dispatched immediately without follow-up questions.")
        return result

    # 4. Check Groq API
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is missing. Add it to your .env file and restart.",
        )

    # 5. Construct AI Prompt with Adaptive Clearance & Language Rules
    language_directive = LANGUAGE_DIRECTIVES.get(lang, LANGUAGE_DIRECTIVES["en"])

    workflow_instructions = f"""
{language_directive}

DYNAMIC MULTI-TURN CLINICAL INTAKE RULES:
1. PROGRESS: Turn #{current_question_number} (Questions answered so far: {follow_up_count} of target {PREFERRED_FOLLOW_UP_QUESTIONS}).
2. MULTI-TURN INTAKE MANDATE (DO NOT STOP AFTER 1 QUESTION):
   - For all health concerns and symptom queries (sore throat, fever, cough, stomach ache, fatigue, etc.), you MUST ask follow-up questions to understand the entire clinical picture before giving a final recommendation!
   - DO NOT return `status: "recommendation"` on turn 0, 1, or 2 unless an acute life-threatening emergency is detected.
   - You must gather the complete clinical info across sequential turns:
     * Question 1: Nature of discomfort, sensation, and onset.
     * Question 2: Associated symptoms, fever, chills, and body aches.
     * Question 3: Functional & safety red flags (breathing ease, swallowing, hydration, lethargy).
     * Question 4: Duration, previous remedies tried, and underlying health conditions.
   - When asking a follow-up question, return `status: "follow_up_needed"`, an atomic question with exactly one '?', and 3-4 multi-select compatible options.
3. FINAL RECOMMENDATION AT TURN ~{PREFERRED_FOLLOW_UP_QUESTIONS}:
   - Once {PREFERRED_FOLLOW_UP_QUESTIONS} questions have been answered, synthesize ALL previous answers and deliver the comprehensive, personalized recommendation. Set `status: "recommendation"`, `follow_up_question: null`, and `options: []`.
"""

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT + "\n\n" + workflow_instructions
        }
    ]

    for turn in request.conversation_history:
        if turn.role in ("user", "assistant") and turn.content:
            messages.append({
                "role": turn.role,
                "content": turn.content,
            })

    if follow_up_count == 0:
        current_user_msg = (
            f"Language: {lang}\n"
            f"Initial patient symptoms: {message}\n"
            f"Location: {request.location or 'Delhi NCR'}\n\n"
            f"Progress: Question 1 of {PREFERRED_FOLLOW_UP_QUESTIONS}.\n"
            "Ask the first atomic clarifying question about the nature, sensation, or onset of this symptom.\n"
            "Return the required JSON only."
        )
    else:
        current_user_msg = (
            f"Language: {lang}\n"
            f"Latest patient answer: {message}\n"
            f"Location: {request.location or 'Delhi NCR'}\n\n"
            f"Progress: {follow_up_count} of {PREFERRED_FOLLOW_UP_QUESTIONS} follow-up questions completed.\n"
            + (
                f"Ask the next atomic clarifying question building upon the previous answers.\n"
                if follow_up_count < PREFERRED_FOLLOW_UP_QUESTIONS
                else "You now have the complete clinical information. Synthesize all answers into the final comprehensive recommendation.\n"
            )
            + "Return the required JSON only."
        )

    messages.append({
        "role": "user",
        "content": current_user_msg,
    })

    # 5. Call Groq with Multi-Model Failover and 8s Timeout
    result = None
    last_error = None
    client = Groq(api_key=GROQ_API_KEY, timeout=8.0)

    candidate_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]

    for attempt, model_name in enumerate(candidate_models):
        try:
            completion = client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            content = completion.choices[0].message.content
            if content:
                result = json.loads(content)
                print(f"Groq inference succeeded using model: {model_name}")
                break
        except Exception as error:
            last_error = error
            print(f"Groq model {model_name} attempt error: {str(error)[:120]}")
            if attempt < len(candidate_models) - 1:
                time.sleep(0.3)

    # Fallback to local clinical synthesizer if Groq is unavailable
    if result is None or not isinstance(result, dict):
        print("Groq inference fallback engaged:", str(last_error))
        result = {
            "status": "follow_up_needed" if follow_up_count < PREFERRED_FOLLOW_UP_QUESTIONS else "recommendation",
            "follow_up_question": None,
            "options": [],
            "other_option_placeholder": DEFAULT_OTHER_PLACEHOLDERS.get(lang),
            "care_type": None if follow_up_count < PREFERRED_FOLLOW_UP_QUESTIONS else "gp_teleconsult",
            "urgency": None if follow_up_count < PREFERRED_FOLLOW_UP_QUESTIONS else "routine",
            "red_flags": [],
            "reasoning": "",
            "next_steps": [],
            "home_care": [],
            "warning_signs": [],
        }

    # 6. Check for Emergency Red Flags in AI response
    if (
        result.get("care_type") == "emergency_referral"
        or result.get("urgency") == "immediate"
        or (isinstance(result.get("red_flags"), list) and len(result["red_flags"]) > 0)
    ):
        result = emergency_response(
            result["red_flags"][0] if result.get("red_flags") else "Immediate emergency referral",
            lang=lang,
        )
        save_assessment(result)
        return result

    # 7. PROCESS AI DECISION & ENFORCE MULTI-TURN INTAKE
    ai_status = (result.get("status") or "").strip().lower()
    q_text = (result.get("follow_up_question") or "").strip()
    has_valid_question = bool(q_text and "?" in q_text and len(q_text) >= 8)

    # We must collect the entire info across questions before giving recommendations
    should_ask_follow_up = follow_up_count < PREFERRED_FOLLOW_UP_QUESTIONS

    if not should_ask_follow_up:
        # Full clinical picture collected -> deliver comprehensive recommendation
        result["status"] = "recommendation"
        result["follow_up_question"] = None
        result["options"] = []
        result["other_option_placeholder"] = None

        if not result.get("care_type"):
            result["care_type"] = "gp_teleconsult"
        if not result.get("urgency"):
            result["urgency"] = "routine"

        # Ensure guidance is populated and in the correct language
        fallback_rec = get_fallback_recommendation(patient_text, lang)

        if not result.get("reasoning") or len(result["reasoning"]) < 20:
            result["reasoning"] = fallback_rec["reasoning"]

        if not result.get("home_care") or len(result["home_care"]) == 0:
            result["home_care"] = fallback_rec["home_care"]

        if not result.get("next_steps") or len(result["next_steps"]) == 0:
            result["next_steps"] = fallback_rec["next_steps"]

        if not result.get("warning_signs") or len(result["warning_signs"]) == 0:
            result["warning_signs"] = fallback_rec["warning_signs"]

        if not result.get("recommended_tests") or len(result["recommended_tests"]) == 0:
            result["recommended_tests"] = fallback_rec["recommended_tests"]

        if not result.get("nurse_care_option"):
            result["nurse_care_option"] = fallback_rec["nurse_care_option"]

    else:
        # Still clarifying: enforce follow-up question to take entire info
        result["status"] = "follow_up_needed"
        result["care_type"] = None
        result["urgency"] = None
        result["next_steps"] = []
        result["home_care"] = []
        result["warning_signs"] = []

        if not has_valid_question:
            synth_q, synth_opts = get_fallback_question(patient_text, follow_up_count, lang)
            result["follow_up_question"] = synth_q
            result["options"] = synth_opts
        else:
            result["options"] = normalize_follow_up_options(result.get("options"), lang=lang)

        result["other_option_placeholder"] = DEFAULT_OTHER_PLACEHOLDERS.get(lang, DEFAULT_OTHER_PLACEHOLDERS["en"])

    # 8. Caregiver Matching (Only for final recommendations)
    result["caregivers"] = []
    if result["status"] == "recommendation":
        care_type = result.get("care_type")
        if care_type in {"nurse_home_visit", "paramedic_home_visit", "gp_teleconsult"}:
            result["caregivers"] = match_caregivers(
                care_type=care_type,
                language=lang,
            )

    # 9. Save and Return
    save_assessment(result)
    print(f"Assessment completed: status={result['status']}, care_type={result.get('care_type')}")
    return result
