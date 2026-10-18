/**
 * voiceService.js
 * Provides accessible, respectful speech synthesis (Text-to-Speech) using
 * the browser's local window.speechSynthesis API.
 *
 * Guarantees:
 * 1. 100% offline - uses local browser speech engines without cloud transmission.
 * 2. Unhurried, dementia-appropriate pacing (rate ~0.85, pitch 1.0, volume 0.8).
 * 3. Graceful handling of unsupported browsers.
 * 4. Immediate stop/cancel controls on user exit or request.
 */

class VoiceService {
  constructor() {
    this.isSpeaking = false;
    this.listeners = new Set();
  }

  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyState(speaking) {
    this.isSpeaking = speaking;
    this.listeners.forEach(cb => cb(speaking));
  }

  /**
   * Reads text aloud with calming pacing.
   * @param {string} text - The text to read
   * @param {Object} options - Custom rate/pitch/onEnd callbacks
   */
  speak(text, options = {}) {
    if (!this.isSupported()) {
      return false;
    }

    if (!text || typeof text !== 'string') {
      return false;
    }

    // Stop any ongoing speech before starting new
    this.stop();

    try {
      const UtteranceClass = window.SpeechSynthesisUtterance;
      const utterance = new UtteranceClass(text);
      utterance.rate = options.rate || 0.85; // Unhurried, clear cadence
      utterance.pitch = options.pitch || 1.0; // Natural, neutral pitch
      utterance.volume = options.volume !== undefined ? options.volume : 0.85;

      utterance.onstart = () => {
        this.notifyState(true);
      };

      utterance.onend = () => {
        this.notifyState(false);
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = err => {
        console.warn('SpeechSynthesis error:', err);
        this.notifyState(false);
        if (options.onError) options.onError(err);
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('SpeechSynthesis invocation failed:', e);
      this.notifyState(false);
      return false;
    }
  }

  /**
   * Immediately stops any active audio speech.
   */
  stop() {
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignored
    }
    this.notifyState(false);
  }
}

export const voiceService = new VoiceService();
