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
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
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
   * Speak text aloud with kid-friendly educator voice settings
   * @param {string} text - The text to speak
   * @param {Function} [onEnd] - Callback when speech finishes
   */
  speak(text, onEnd) {
    if (!this.enabled || !this.isAvailable()) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.rate = 0.80;    // Clear and gently paced for kids
    this.utterance.pitch = 1.15;   // Melodic, cheerful educator pitch
    this.utterance.volume = 1.0;
    this.utterance.lang = 'en-US';

    this._applyBestVoice();

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

  /**
   * Speak a word extra slowly and clearly for phonetic articulation
   */
  speakWordSlowly(word, onEnd) {
    if (!this.enabled || !this.isAvailable()) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    this.utterance = new SpeechSynthesisUtterance(word);
    this.utterance.rate = 0.65;    // Slow articulation
    this.utterance.pitch = 1.10;
    this.utterance.volume = 1.0;
    this.utterance.lang = 'en-US';

    this._applyBestVoice();

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

  /**
   * Speak an individual character crisply and cleanly
   */
  speakChar(char, onEnd) {
    if (!this.enabled || !this.isAvailable()) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    const cleanChar = String(char).toUpperCase().trim();
    this.utterance = new SpeechSynthesisUtterance(cleanChar);
    this.utterance.rate = 0.85;
    this.utterance.pitch = 1.20;
    this.utterance.volume = 1.0;
    this.utterance.lang = 'en-US';

    this._applyBestVoice();

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

  /**
   * Speak an individual letter with phonics sound
   */
  speakPhonicsLetter(letter, onEnd) {
    if (!this.enabled || !this.isAvailable()) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    const l = letter.toUpperCase();
    const phonicsMap = {
      'A': 'A... ae', 'B': 'B... buh', 'C': 'C... kuh', 'D': 'D... duh',
      'E': 'E... eh', 'F': 'F... fuh', 'G': 'G... guh', 'H': 'H... huh',
      'I': 'I... ih', 'J': 'J... juh', 'K': 'K... kuh', 'L': 'L... luh',
      'M': 'M... muh', 'N': 'N... nuh', 'O': 'O... aw', 'P': 'P... puh',
      'Q': 'Q... kwuh', 'R': 'R... ruh', 'S': 'S... sss', 'T': 'T... tuh',
      'U': 'U... uh', 'V': 'V... vuh', 'W': 'W... wuh', 'X': 'X... kss',
      'Y': 'Y... yuh', 'Z': 'Z... zzz'
    };

    const textToSpeak = phonicsMap[l] || l;
    this.utterance = new SpeechSynthesisUtterance(textToSpeak);
    this.utterance.rate = 0.75;
    this.utterance.pitch = 1.20;
    this.utterance.volume = 1.0;
    this.utterance.lang = 'en-US';

    this._applyBestVoice();

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

  /**
   * Spell out letters one by one then pronounce the full word
   */
  spellOutWord(word, onEnd) {
    const letters = word.split('').join(', ');
    const fullText = `${letters}... ${word}!`;
    this.speak(fullText, onEnd);
  }

  /**
   * Spell out letter-by-letter sound, then pronounce full word at the end
   */
  spellOutWordAndPronounce(word, onEnd) {
    if (!this.enabled || !this.isAvailable()) {
      if (onEnd) onEnd();
      return;
    }

    const letters = word.toUpperCase().split('').join(', ');
    const fullText = `${letters}... ${word}!`;
    
    this.stop();
    this.utterance = new SpeechSynthesisUtterance(fullText);
    this.utterance.rate = 0.70;    // Clear and slow pacing for kids
    this.utterance.pitch = 1.15;
    this.utterance.volume = 1.0;
    this.utterance.lang = 'en-US';

    this._applyBestVoice();

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

  /** Helper to select highest quality natural voice */
  _applyBestVoice() {
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Jenny') || v.name.includes('Aria'))
    ) || voices.find(
      v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    ) || voices.find(
      v => v.lang.startsWith('en')
    );

    if (preferredVoice) {
      this.utterance.voice = preferredVoice;
    }
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
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
