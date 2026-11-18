class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private bgmEnabled: boolean = true;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private bgmMode: 'normal' | 'boss' = 'normal';

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopBgm();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setBgmEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBgm();
    }
  }

  public isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    gainVal: number,
    delay: number = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freqStart), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(25, freqEnd), now + duration);

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  private playNoise(duration: number, filterFreq: number, gainVal: number, delay: number = 0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleCount * 0.45));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }

  public playShoot(kind: 'pistol' | 'heavy_mg' | 'shotgun' | 'rocket' | 'flame' | 'tank'): void {
    if (this.muted) return;
    switch (kind) {
      case 'pistol':
        this.playTone(540, 140, 0.08, 'square', 0.11);
        this.playNoise(0.05, 2200, 0.12);
        break;
      case 'heavy_mg':
        this.playTone(460, 110, 0.065, 'sawtooth', 0.12);
        this.playNoise(0.045, 2800, 0.14);
        break;
      case 'shotgun':
        this.playTone(220, 55, 0.18, 'sawtooth', 0.16);
        this.playNoise(0.18, 1600, 0.25);
        break;
      case 'rocket':
        this.playTone(180, 420, 0.2, 'sawtooth', 0.12);
        this.playNoise(0.22, 1400, 0.18);
        break;
      case 'flame':
        this.playNoise(0.11, 950, 0.13);
        break;
      case 'tank':
        this.playTone(150, 38, 0.28, 'square', 0.2);
        this.playNoise(0.26, 900, 0.26);
        break;
    }
  }

  public playMelee(): void {
    this.playTone(680, 180, 0.09, 'triangle', 0.14);
    this.playNoise(0.06, 3600, 0.12);
  }

  public playJump(): void {
    this.playTone(190, 480, 0.11, 'square', 0.08);
  }

  public playExplosion(large: boolean = false): void {
    if (this.muted) return;
    if (large) {
      this.playTone(110, 28, 0.45, 'sawtooth', 0.22);
      this.playNoise(0.5, 650, 0.34);
    } else {
      this.playTone(140, 38, 0.24, 'square', 0.14);
      this.playNoise(0.25, 1100, 0.22);
    }
  }

  public playHit(metallic: boolean = false): void {
    if (metallic) {
      this.playTone(920, 540, 0.05, 'triangle', 0.08);
    } else {
      this.playTone(260, 95, 0.06, 'square', 0.08);
    }
  }

  public playPickup(): void {
    this.playTone(523.25, 523.25, 0.07, 'square', 0.1, 0);
    this.playTone(659.25, 659.25, 0.07, 'square', 0.1, 0.06);
    this.playTone(783.99, 1046.5, 0.14, 'square', 0.12, 0.12);
  }

  public playPowRescue(): void {
    this.playTone(440, 440, 0.07, 'triangle', 0.12, 0);
    this.playTone(554.37, 554.37, 0.07, 'triangle', 0.12, 0.07);
    this.playTone(659.25, 880, 0.18, 'triangle', 0.14, 0.14);
  }

  public playPlayerHurt(): void {
    this.playTone(320, 85, 0.22, 'sawtooth', 0.18);
    this.playNoise(0.14, 1200, 0.16);
  }

  public playBossWarning(): void {
    for (let i = 0; i < 3; i++) {
      this.playTone(440, 290, 0.22, 'sawtooth', 0.14, i * 0.32);
    }
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const times = [0, 0.1, 0.2, 0.3, 0.46, 0.58];
    const durs = [0.09, 0.09, 0.09, 0.14, 0.1, 0.32];
    notes.forEach((n, idx) => {
      this.playTone(n, n, durs[idx], 'square', 0.11, times[idx]);
    });
  }

  public startBgm(mode: 'normal' | 'boss'): void {
    this.bgmMode = mode;
    if (this.muted || !this.bgmEnabled) return;
    if (this.bgmTimer !== null) return;

    this.ensureContext();
    const intervalMs = 155;
    this.bgmTimer = window.setInterval(() => {
      if (this.muted || !this.bgmEnabled) return;
      const ctx = this.ctx;
      if (!ctx || ctx.state !== 'running') return;

      const step = this.bgmStep % 16;
      this.bgmStep++;

      // Driving retro military arcade bassline
      const normalBass = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83, 98, 98, 110, 130.81, 146.83, 130.81, 110, 98];
      const bossBass = [92.5, 92.5, 110, 92.5, 123.47, 92.5, 138.59, 123.47, 82.41, 82.41, 92.5, 110, 123.47, 110, 92.5, 82.41];
      const freq = this.bgmMode === 'boss' ? bossBass[step] : normalBass[step];

      this.playTone(freq, freq * 0.96, 0.11, 'triangle', 0.055);

      // Subtle hi-hat / snare pulse
      if (step % 4 === 2) {
        this.playNoise(0.045, 2400, 0.035);
      } else if (step % 2 === 0) {
        this.playTone(90, 42, 0.06, 'sine', 0.05);
      }

      // Occasional crisp arcade lead accent
      if (this.bgmMode === 'boss' && (step === 0 || step === 6 || step === 12)) {
        this.playTone(freq * 4, freq * 3.9, 0.1, 'square', 0.028);
      } else if (this.bgmMode === 'normal' && (step === 0 || step === 8)) {
        this.playTone(freq * 3, freq * 3, 0.08, 'square', 0.022);
      }
    }, intervalMs);
  }

  public setBgmMode(mode: 'normal' | 'boss'): void {
    this.bgmMode = mode;
  }

  public stopBgm(): void {
    if (this.bgmTimer !== null) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const sound = new RetroAudioEngine();
