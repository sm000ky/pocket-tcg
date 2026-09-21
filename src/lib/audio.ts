// 100% Procedural Web Audio Engine + Haptics for Pokémon TCG Pocket
// High-punch tactile audio feedback with zero external files

class PocketAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private triggerHaptic(pattern: number | number[]) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore mobile browser restrictions
      }
    }
  }

  // Continuous crinkling texture as finger drags along the foil seam
  public playFoilCrinkle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.triggerHaptic(8);

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // Full crunchy metallic rip + low-end foil breach POP
  public playPackTear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.triggerHaptic([35, 45, 80, 40, 110]);

    const t = this.ctx.currentTime;

    // 1. Crunchy tearing noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.65);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(4800, t);
    bandpass.frequency.exponentialRampToValueAtTime(500, t + 0.6);
    bandpass.Q.setValueAtTime(4.2, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, t);
    noiseGain.gain.linearRampToValueAtTime(0.75, t + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);

    // 2. Heavy Sub-Bass Pop when the airtight seal breaks
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.4);

    subGain.gain.setValueAtTime(0.85, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.4);
  }

  // Upward rising whoosh + melodic shimmer when cards slide out from the opened pack
  public playPackCardsEmerge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.triggerHaptic([20, 30, 50]);

    const t = this.ctx.currentTime;

    // Rising sine sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);

    // Complementary glass chime
    const chimeFrequencies = [587.33, 880.0, 1174.66, 1760.0];
    chimeFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const cOsc = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      cOsc.type = 'triangle';
      cOsc.frequency.setValueAtTime(freq, t + 0.15 + idx * 0.05);

      cGain.gain.setValueAtTime(0.01, t + 0.15 + idx * 0.05);
      cGain.gain.linearRampToValueAtTime(0.12, t + 0.16 + idx * 0.05);
      cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45 + idx * 0.05);

      cOsc.connect(cGain);
      cGain.connect(this.ctx.destination);
      cOsc.start(t + 0.15 + idx * 0.05);
      cOsc.stop(t + 0.45 + idx * 0.05);
    });
  }

  // Card sliding out of sleeve with snappy paper friction
  public playCardSlide() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.triggerHaptic(18);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(560, t);
    osc.frequency.exponentialRampToValueAtTime(170, t + 0.22);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Snappy physical card flip sound
  public playCardFlip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.triggerHaptic([20, 35]);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1050, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.13);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // Suspense riser when holding/revealing a high-tier rare card
  public playTensionRiser() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.triggerHaptic([15, 25, 40]);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.85);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.linearRampToValueAtTime(3200, t + 0.85);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.9);
  }

  // Heavy Impact Boom for Crown / Immersive / Ultra Rare reveal
  public playImpactBoom() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.triggerHaptic([90, 60, 140]);

    const t = this.ctx.currentTime;

    // Sub bass drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, t);
    subOsc.frequency.exponentialRampToValueAtTime(28, t + 0.8);

    subGain.gain.setValueAtTime(0.95, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.8);
  }

  // Crystalline sparkle arpeggio for Holo cards
  public playHoloSparkle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.triggerHaptic(15);

    const frequencies = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
    const baseTime = this.ctx.currentTime;

    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, baseTime + idx * 0.04);

      gain.gain.setValueAtTime(0.01, baseTime + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.2, baseTime + idx * 0.04 + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        baseTime + idx * 0.04 + 0.3
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(baseTime + idx * 0.04);
      osc.stop(baseTime + idx * 0.04 + 0.3);
    });
  }

  // Triumphant Fanfare for 3-Star Immersive or Crown Gold
  public playCrownFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.playImpactBoom();

    const notes = [
      { f: 440, start: 0.0, dur: 0.16 },
      { f: 554.37, start: 0.13, dur: 0.16 },
      { f: 659.25, start: 0.26, dur: 0.2 },
      { f: 880, start: 0.44, dur: 0.7 },
      { f: 1108.73, start: 0.58, dur: 0.85 },
    ];
    const baseTime = this.ctx.currentTime;

    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, baseTime + n.start);

      gain.gain.setValueAtTime(0.01, baseTime + n.start);
      gain.gain.linearRampToValueAtTime(0.32, baseTime + n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, baseTime + n.start + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(baseTime + n.start);
      osc.stop(baseTime + n.start + n.dur);
    });
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.triggerHaptic(10);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(640, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }
}

export const pocketAudio = new PocketAudioEngine();
