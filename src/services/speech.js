/**
 * CareCompass Speech Service
 * High-Accuracy Multilingual Speech-to-Text (STT) & Speech-to-Speech (TTS)
 * Specialized for Indian accents, Hindi (hi-IN), Indian English (en-IN), and code-mixed Hinglish.
 */

class SpeechService {
  constructor() {
    this.isListening = false;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isSpeaking = false;
    this.voices = [];

    // MediaRecorder state for STT
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.mediaStream = null;

    // Callbacks
    this.activeCallbacks = null;

    if (typeof window !== 'undefined' && this.synthesis) {
      this.loadVoices();
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
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
    return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Start Speech Recording for STT
   */
  async startListening({ language = 'hi', onResult, onError, onEnd, onTranscribing }) {
    if (this.isListening) {
      await this.stopListening();
    }

    this.audioChunks = [];
    this.activeCallbacks = { onResult, onError, onEnd, onTranscribing, language };
    this.isListening = true;

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true
          }
        });
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
        console.log('[CareCompass STT] Audio recording started...');
        return true;
      } else {
        throw new Error('Audio recording is not supported in this browser environment.');
      }
    } catch (micErr) {
      console.warn('[CareCompass STT] Mic permission error:', micErr.message);
      this.isListening = false;
      if (onError) {
        onError(micErr.name === 'NotAllowedError'
          ? 'Microphone access denied. Please grant microphone permissions.'
          : 'Could not access microphone.');
      }
      if (onEnd) onEnd();
      return false;
    }
  }

  /**
   * Stop recording and send audio to STT service
   */
  async stopListening() {
    if (!this.isListening) return;
    this.isListening = false;

    const callbacks = this.activeCallbacks || {};
    const { onResult, onError, onEnd, onTranscribing, language } = callbacks;

    // Stop MediaStream tracks
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        // Ignored
      }
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.onstop = async () => {
          if (this.audioChunks.length === 0) {
            if (onEnd) onEnd();
            return;
          }

          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          if (audioBlob.size < 600) {
            // Empty / accidental tap
            if (onEnd) onEnd();
            return;
          }

          if (onTranscribing) onTranscribing(true);

          try {
            console.log(`[CareCompass STT] Uploading audio (${audioBlob.size} bytes)...`);
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
              console.log(`[CareCompass STT] Transcribed: "${transcript}"`);
              if (transcript && onResult) {
                onResult({ transcript, isFinal: true, engine: data.engine || 'native' });
              }
            } else {
              let detail = '';
              try {
                const errData = await res.json();
                detail = errData.detail || errData.error || '';
              } catch (e) {}
              console.warn('[CareCompass STT] /api/transcribe failed:', detail || res.status);
              if (onError) onError('Could not transcribe audio. Please type your message.');
            }
          } catch (err) {
            console.error('[CareCompass STT] STT upload network error:', err);
            if (onError) onError('Network error during speech transcription.');
          } finally {
            if (onTranscribing) onTranscribing(false);
            if (onEnd) onEnd();
          }
        };

        this.mediaRecorder.stop();
        return;
      } catch (recStopErr) {
        console.warn('[CareCompass STT] MediaRecorder stop error:', recStopErr);
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
      utterance.rate = rate || 0.95;
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
