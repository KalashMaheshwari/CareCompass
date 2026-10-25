import os
from pathlib import Path
from dotenv import load_dotenv
from sarvamai import SarvamAI

# Load .env file from project or backend directory
env_path = Path(__file__).resolve().parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

api_key = os.getenv("SARVAM_API_KEY")
if not api_key:
    raise ValueError("SARVAM_API_KEY environment variable not found. Please set it in your .env file.")

client = SarvamAI(api_subscription_key=api_key)

sample_wav = Path(__file__).resolve().parent / "test_sample.wav"
if not sample_wav.exists():
    raise FileNotFoundError(f"Sample audio file not found at {sample_wav}")

print("Making test API call to Sarvam AI Speech-to-Text (saaras:v3)...")

with open(sample_wav, "rb") as audio_file:
    response = client.speech_to_text.transcribe(
        file=("sample.wav", audio_file, "audio/wav"),
        model="saaras:v3",
        language_code="unknown",
        mode="transcribe"
    )

print("\n--- Sarvam AI STT API Response ---")
print(f"Detected Language : {getattr(response, 'language_code', 'unknown')}")
print(f"Transcript        : {getattr(response, 'transcript', '')!r}")
print("API call successful!")
