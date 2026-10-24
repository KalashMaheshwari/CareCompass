/**
 * Speech Recognition (STT) and Speech Synthesis (TTS) Service
 * Supports Hindi (hi-IN) and English (en-IN)
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isSpeaking = false;
    this.voices = [];

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
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

  /**
   * Start Speech Recognition
   */
  startListening({ language = 'hi', onResult, onError, onEnd }) {
    if (this.isListening) {
      this.stopListening();
    }

    if (!this.recognition) {
      console.warn('Browser SpeechRecognition not supported in this environment.');
      if (onError) onError('Speech recognition not supported in this browser. You can type instead.');
      return false;
    }

    try {
      this.recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      
      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (onResult) {
          onResult({
            transcript: finalTranscript || interimTranscript,
            isFinal: Boolean(finalTranscript)
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        this.isListening = false;
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      this.isListening = false;
      if (onError) onError(err.message);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
    }
    this.isListening = false;
  }

  /**
   * Speak text out loud (TTS)
   */
  speak(text, { language = 'en', onStart, onEnd } = {}) {
    if (!this.synthesis || !text) return;

    this.stopSpeaking();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95; // Slightly slower for elderly comprehension
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
