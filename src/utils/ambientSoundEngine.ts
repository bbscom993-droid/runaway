/**
 * Web Audio API Ambient Sound Synthesizer for Wartakini Reading Experience
 * Produces clean, offline-ready background soundscapes without external audio dependencies.
 */

export interface AmbientTrack {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'zen_pad',
    name: 'Zen Harmonic Pad',
    description: 'Harmoni nada meditasi yang lembut dan menenangkan',
    iconName: 'Sparkles',
  },
  {
    id: 'rain_focus',
    name: 'Hujan & Suasana Rintik',
    description: 'Deru hujan alami untuk meningkatkan fokus membaca',
    iconName: 'CloudRain',
  },
  {
    id: 'lofi_lounge',
    name: 'Lo-Fi Vintage Warmth',
    description: 'Suasana kehangatan kaset vinyl & nada piano retro',
    iconName: 'Disc',
  },
  {
    id: 'ocean_waves',
    name: 'Deru Ombak Samudra',
    description: 'Gelombang alunan samudra yang menyejukkan pikiran',
    iconName: 'Waves',
  },
];

class AmbientSoundEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrackId: string | null = null;
  private isPlaying: boolean = false;
  private activeNodes: (AudioNode | number)[] = [];
  private currentVolume: number = 0.3; // Default 30%

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.audioCtx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getActiveTrack(): string | null {
    return this.currentTrackId;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stop() {
    this.cleanupNodes();
    this.isPlaying = false;
    this.currentTrackId = null;
  }

  private cleanupNodes() {
    this.activeNodes.forEach((item) => {
      if (typeof item === 'number') {
        window.clearInterval(item);
      } else {
        try {
          if ('stop' in item && typeof (item as AudioScheduledSourceNode).stop === 'function') {
            (item as AudioScheduledSourceNode).stop();
          }
          item.disconnect();
        } catch {
          // ignore cleanup errors
        }
      }
    });
    this.activeNodes = [];
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
  }

  public play(trackId: string, volume: number = this.currentVolume) {
    this.stop();
    this.currentVolume = volume;
    const ctx = this.getAudioContext();

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.currentVolume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    this.currentTrackId = trackId;
    this.isPlaying = true;

    switch (trackId) {
      case 'zen_pad':
        this.createZenPad(ctx, this.masterGain);
        break;
      case 'rain_focus':
        this.createRainSound(ctx, this.masterGain);
        break;
      case 'lofi_lounge':
        this.createLoFiSound(ctx, this.masterGain);
        break;
      case 'ocean_waves':
        this.createOceanWaves(ctx, this.masterGain);
        break;
      default:
        this.createZenPad(ctx, this.masterGain);
        break;
    }
  }

  // 1. Zen Harmonic Pad (Ambient Sine Chords with LFO modulation)
  private createZenPad(ctx: AudioContext, destination: GainNode) {
    const freqs = [174.61, 220.00, 261.63, 329.63, 392.00]; // F3, A3, C4, E4, G4 (Fmaj7)
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Subtle pitch drift for analog feel
      osc.detune.setValueAtTime((idx % 2 === 0 ? 1 : -1) * (idx + 1) * 2, ctx.currentTime);

      // LFO volume swell
      lfo.frequency.setValueAtTime(0.08 + idx * 0.02, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.05, ctx.currentTime);
      lfo.connect(lfoGain.gain);

      gain.gain.setValueAtTime(0.08 / freqs.length, ctx.currentTime);

      osc.connect(gain);
      gain.connect(destination);
      lfo.connect(lfoGain);

      osc.start();
      lfo.start();

      this.activeNodes.push(osc, gain, lfo, lfoGain);
    });
  }

  // 2. Rain & Wind Sound (Filtered White Noise with modulation)
  private createRainSound(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate rain frequency
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.18, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(destination);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);

    // Random soft raindrop triggers
    const timerId = window.setInterval(() => {
      if (!this.isPlaying || !this.audioCtx) return;
      if (Math.random() > 0.4) {
        const dropOsc = ctx.createOscillator();
        const dropGain = ctx.createGain();

        dropOsc.type = 'sine';
        const startFreq = 1200 + Math.random() * 1800;
        dropOsc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        dropOsc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);

        dropGain.gain.setValueAtTime(0.03, ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

        dropOsc.connect(dropGain);
        dropGain.connect(destination);

        dropOsc.start();
        dropOsc.stop(ctx.currentTime + 0.09);
      }
    }, 180);

    this.activeNodes.push(timerId);
  }

  // 3. Lo-Fi Vintage Warmth (Warm Filtered Noise + Warm Keyboard Tones)
  private createLoFiSound(ctx: AudioContext, destination: GainNode) {
    // Vinyl crackle noise
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Occasional pops
      if (Math.random() < 0.002) {
        output[i] = (Math.random() * 2 - 1) * 0.8;
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.05;
      }
    }

    const vinylNoise = ctx.createBufferSource();
    vinylNoise.buffer = noiseBuffer;
    vinylNoise.loop = true;

    const vinylFilter = ctx.createBiquadFilter();
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.setValueAtTime(800, ctx.currentTime);
    vinylFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    const vinylGain = ctx.createGain();
    vinylGain.gain.setValueAtTime(0.08, ctx.currentTime);

    vinylNoise.connect(vinylFilter);
    vinylFilter.connect(vinylGain);
    vinylGain.connect(destination);

    vinylNoise.start();
    this.activeNodes.push(vinylNoise, vinylFilter, vinylGain);

    // Soft jazzy chord progression (Dm7 - G7 - Cmaj7 - Am7)
    const chords = [
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [246.94, 392.00, 440.00, 587.33], // G7
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentChord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.8);

        osc.connect(gain);
        gain.connect(destination);

        osc.start();
        osc.stop(ctx.currentTime + 3.9);
      });
    };

    playChord();
    const intervalId = window.setInterval(playChord, 4000);
    this.activeNodes.push(intervalId);
  }

  // 4. Ocean Waves (LFO Modulated Pink Noise)
  private createOceanWaves(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const pinkNoise = ctx.createBufferSource();
    pinkNoise.buffer = noiseBuffer;
    pinkNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    // LFO for wave modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // Wave period ~8.3 seconds
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);

    lfo.connect(filter.frequency);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.2, ctx.currentTime);

    pinkNoise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(destination);

    pinkNoise.start();
    lfo.start();

    this.activeNodes.push(pinkNoise, filter, lfo, lfoGain, waveGain);
  }
}

export const ambientEngine = new AmbientSoundEngine();
