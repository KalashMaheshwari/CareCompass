/**
 * CareCompass Speech Service
 * Dual-Engine Multilingual Speech-to-Text (STT) & Speech-to-Speech (TTS)
 * Supports Hindi (hi-IN), English (en-IN), and Hinglish
 *
 * Engine 1: Real-time Client Streaming via Browser Web Speech API (zero latency)
 * Engine 2: State-of-the-Art Multilingual Whisper STT (/api/transcribe) via Groq (whisper-large-v3-turbo)
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isSpeaking = false;
    this.voices = [];

    // MediaRecorder state for Whisper backup
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.mediaStream = null;
    this.accumulatedTranscript = '';
    this.hasLiveTranscript = false;

    // Callbacks
    this.activeCallbacks = null;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }

      if (this.synthesis) {
        this.loadVoices();
        if (this.synthesis.onvoiceschanged !== undefined) {
          this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  loadVoices() {
    if (!this.synthesis) return;
    this.voices = this.synthesis.getVoices() || [];
  }

  getBestVoice(lang = 'en') {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    const targetLang = lang === 'hi' ? 'hi' : 'en';
    const match = this.voices.find(v => v.lang.toLowerCase().startsWith(targetLang));
    return match || this.voices[0] || null;
  }

  isSpeechRecognitionSupported() {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Start Speech Recognition with Dual Engine:
   * 1. Live stream typing via Web Speech API (hi-IN / en-IN)
   * 2. High-accuracy audio recording via MediaRecorder -> Whisper fallback
   */
  async startListening({ language = 'hi', onResult, onError, onEnd, onTranscribing }) {
    if (this.isListening) {
      this.stopListening();
    }

    this.accumulatedTranscript = '';
    this.hasLiveTranscript = false;
    this.audioChunks = [];
    this.activeCallbacks = { onResult, onError, onEnd, onTranscribing, language };
    this.isListening = true;

    // 1. Initialize audio recording for Whisper backup (if mic permissions granted)
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaStream = stream;

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');

        const recorderOptions = mimeType ? { mimeType } : undefined;
        this.mediaRecorder = new MediaRecorder(stream, recorderOptions);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start(250); // Collect slices every 250ms
      }
    } catch (micErr) {
      console.warn('[CareCompass STT] MediaRecorder mic access notice:', micErr.message);
      // If mic was explicitly denied, notify user
      if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
        this.isListening = false;
        if (onError) onError('Microphone access was denied. Please allow microphone permissions in your browser.');
        return false;
      }
    }

    // 2. Start Live Web Speech API if supported
    if (this.recognition) {
      try {
        // Map language: 'hi' or 'hinglish' uses Indian Hindi model; 'en' uses Indian English model
        this.recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';

        this.recognition.onstart = () => {
          this.isListening = true;
        };

        this.recognition.onresult = (event) => {
          let interim = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              this.accumulatedTranscript += item[0].transcript + ' ';
              this.hasLiveTranscript = true;
            } else {
              interim += item[0].transcript;
            }
          }

          const combined = (this.accumulatedTranscript + interim).trim();
          if (combined && onResult) {
            this.hasLiveTranscript = true;
            onResult({
              transcript: combined,
              isFinal: false
            });
          }
        };

        this.recognition.onerror = (event) => {
          console.warn('[CareCompass STT] Live SpeechRecognition error event:', event.error);
          // If no-speech or network glitch, do NOT abort if MediaRecorder is active
          if (event.error === 'not-allowed') {
            this.isListening = false;
            if (onError) onError('Microphone permission blocked.');
          }
        };

        this.recognition.onend = () => {
          // If continuous recognition ends while user is still marked as listening, keep listening active unless explicitly stopped
        };

        this.recognition.start();
        return true;
      } catch (err) {
        console.warn('[CareCompass STT] SpeechRecognition start warning:', err.message);
      }
    }

    // If browser Web Speech is not available, but MediaRecorder is recording, we return true!
    return Boolean(this.mediaRecorder);
  }

  /**
   * Stop listening and finalize transcript.
   * If live Web Speech captured the text, deliver it immediately.
   * Otherwise, upload audio to Groq Whisper for instantaneous transcription!
   */
  async stopListening() {
    if (!this.isListening) return;
    this.isListening = false;

    const callbacks = this.activeCallbacks || {};
    const { onResult, onError, onEnd, onTranscribing, language } = callbacks;

    // Stop Web Speech recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
    }

    // Stop MediaStream tracks
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        // Ignored
      }
    }

    // Process final audio via MediaRecorder or deliver live transcript
    const finalLiveText = (this.accumulatedTranscript || '').trim();

    // If we already have a full, high-confidence live transcript from Web Speech API:
    if (finalLiveText && finalLiveText.length >= 3) {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        try { this.mediaRecorder.stop(); } catch (e) {}
      }
      if (onResult) onResult({ transcript: finalLiveText, isFinal: true });
      if (onEnd) onEnd();
      return;
    }

    // If live transcript was empty or unavailable, use Groq Whisper server fallback!
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.onstop = async () => {
          if (this.audioChunks.length === 0) {
            if (onEnd) onEnd();
            return;
          }

          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          if (audioBlob.size < 800) {
            // Less than 800 bytes is essentially empty/silent
            if (onEnd) onEnd();
            return;
          }

          if (onTranscribing) onTranscribing(true);

          try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'speech.webm');
            formData.append('language', language || 'auto');

            const res = await fetch('/api/transcribe', {
              method: 'POST',
              body: formData
            });

            if (res.ok) {
              const data = await res.json();
              const transcript = (data.text || '').trim();
              if (transcript && onResult) {
                onResult({ transcript, isFinal: true });
              }
            } else {
              console.warn('[CareCompass STT] /api/transcribe responded with non-200');
            }
          } catch (err) {
            console.error('[CareCompass STT] Whisper upload error:', err);
            if (onError) onError('Could not transcribe audio. You can type your symptoms.');
          } finally {
            if (onTranscribing) onTranscribing(false);
            if (onEnd) onEnd();
          }
        };

        this.mediaRecorder.stop();
        return;
      } catch (recStopErr) {
        console.warn('MediaRecorder stop error:', recStopErr);
      }
    }

    if (onEnd) onEnd();
  }

  /**
   * Speak text out loud (TTS)
   */
  speak(text, { language = 'en', rate, onStart, onEnd } = {}) {
    if (!this.synthesis || !text) return;

    this.stopSpeaking();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = rate || 0.95; // Configurable speech rate
      utterance.pitch = 1.0;

      const voice = this.getBestVoice(language);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error:', err);
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      this.synthesis.speak(utterance);
    } catch (e) {
      console.warn('Failed to speak utterance:', e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  stopSpeaking() {
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch (e) {
        console.warn('Error cancelling speech synthesis:', e);
      }
    }
    this.isSpeaking = false;
  }
}

export const speechService = new SpeechService();
