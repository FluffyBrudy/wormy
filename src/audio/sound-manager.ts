export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled = true;

  constructor() {
    this.initAudioContext();
    this.generateSounds();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  private generateSounds() {
    if (!this.audioContext) return;

    this.sounds.set("eat", this.generateEatSound());

    this.sounds.set("gameOver", this.generateGameOverSound());

    this.sounds.set("click", this.generateClickSound());

    this.sounds.set("highScore", this.generateHighScoreSound());
  }

  private generateEatSound(): AudioBuffer {
    if (!this.audioContext)
      return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 800 + Math.sin(t * 20) * 200;
      const envelope = Math.exp(-t * 8);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  private generateGameOverSound(): AudioBuffer {
    if (!this.audioContext)
      return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.5;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 - t * 150;
      const envelope = Math.exp(-t * 2);
      const noise = (Math.random() - 0.5) * 0.1;
      data[i] =
        (Math.sin(2 * Math.PI * frequency * t) + noise) * envelope * 0.4;
    }

    return buffer;
  }

  private generateClickSound(): AudioBuffer {
    if (!this.audioContext)
      return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 1000;
      const envelope = Math.exp(-t * 20);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }

    return buffer;
  }

  private generateHighScoreSound(): AudioBuffer {
    if (!this.audioContext)
      return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 440 + Math.sin(t * 8) * 220 + t * 200;
      const envelope = Math.exp(-t * 1.5) * (1 + Math.sin(t * 15) * 0.3);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  public play(soundName: string, volume = 1) {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundName))
      return;

    try {
      const buffer = this.sounds.get(soundName)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (e) {
      console.warn("Error playing sound:", e);
    }
  }

  public toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled() {
    return this.enabled;
  }
}
