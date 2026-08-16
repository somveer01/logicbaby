// ==========================================================================
// SpeechSynthesis Wrapper — Kid-Friendly Voice Narration
// ==========================================================================

class SpeechEngine {
  constructor() {
    this.enabled = true;
    this.speaking = false;
    this.utterance = null;
  }

  /** Check if SpeechSynthesis API is available */
  isAvailable() {
    return 'speechSynthesis' in window;
  }

  /** Toggle voice on/off, returns new state */
  toggleVoice() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }

  /** Set voice enabled state */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  /**
   * Speak text aloud with kid-friendly voice settings
   * @param {string} text - The text to speak
   * @param {Function} [onEnd] - Callback when speech finishes
   */
  speak(text, onEnd) {
    if (!this.enabled || !this.isAvailable()) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any current speech
    this.stop();

    this.utterance = new SpeechSynthesisUtterance(text);

    // Kid-friendly voice settings
    this.utterance.rate = 0.85;    // Slightly slower for kids
    this.utterance.pitch = 1.15;   // Slightly higher pitch — friendly
    this.utterance.volume = 1.0;
    this.utterance.lang = 'en-US';

    // Try to find a female English voice (generally perceived as friendlier for kids)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    ) || voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google'))
    ) || voices.find(
      v => v.lang.startsWith('en')
    );

    if (preferredVoice) {
      this.utterance.voice = preferredVoice;
    }

    this.speaking = true;

    this.utterance.onend = () => {
      this.speaking = false;
      if (onEnd) onEnd();
    };

    this.utterance.onerror = () => {
      this.speaking = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(this.utterance);
  }

  /** Stop any ongoing speech */
  stop() {
    if (this.isAvailable()) {
      window.speechSynthesis.cancel();
    }
    this.speaking = false;
  }

  /** Check if currently speaking */
  isSpeaking() {
    return this.speaking;
  }
}

export const speechService = new SpeechEngine();

// Pre-load voices (some browsers need this)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
