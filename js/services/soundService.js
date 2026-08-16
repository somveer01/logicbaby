// ==========================================================================
// Web Audio API Synthesizer — Zero-Dependency Cheerful Kid Sounds
// ==========================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  /**
   * Initialize (or resume) the AudioContext.
   * Must be called from a user gesture (click/tap) the first time.
   */
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /** Check if Web Audio API is available */
  isAvailable() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }

  /** Toggle sound on/off, returns new state */
  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /** Set sound enabled state */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // ------------------------------------------------------------------
  // Sound Effects
  // ------------------------------------------------------------------

  /**
   * Cheerful ascending chime — played on correct answer
   * Notes: C5 → E5 → G5 → C6 (major arpeggio)
   */
  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + index * 0.08 + 0.35
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + index * 0.08);
      osc.stop(this.ctx.currentTime + index * 0.08 + 0.35);
    });
  }

  /**
   * Gentle descending boop — played on wrong answer.
   * Never harsh or scary for babies!
   */
  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.3);
  }

  /**
   * Quick pop / click — played on button press
   */
  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.06);
  }

  /**
   * Star collect twinkle — played when star counter increments
   */
  playStar() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [1318.51, 1567.98]; // E6, G6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + i * 0.1 + 0.2
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.2);
    });
  }

  /**
   * Level complete fanfare — triumphant melody
   * C5, C5, C5, E5, G5, C6 (like a mini victory march)
   */
  playFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, d: 0.1 },
      { f: 523.25, d: 0.1 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.2 },
      { f: 783.99, d: 0.2 },
      { f: 1046.50, d: 0.45 }
    ];

    let timeOffset = 0;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, this.ctx.currentTime + timeOffset);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + timeOffset + note.d
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + timeOffset);
      osc.stop(this.ctx.currentTime + timeOffset + note.d);

      timeOffset += note.d * 0.85;
    });
  }
}

export const soundService = new SoundEngine();
