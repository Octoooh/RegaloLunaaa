/**
 * Audio helper for preview playback with automatic graceful fallback & Dropbox direct URL parsing
 */

export function formatAudioUrl(url: string): string {
  if (!url) return "";
  let clean = url.trim();
  // Transformar enlaces de Dropbox para que transmitan el audio crudo directamente:
  if (clean.includes("dropbox.com")) {
    clean = clean.replace("www.dropbox.com", "dl.dropboxusercontent.com");
    clean = clean.replace(/[?&]dl=0/, "");
    if (!clean.includes("raw=1") && !clean.includes("dl=1")) {
      clean += (clean.includes("?") ? "&" : "?") + "raw=1";
    }
  }
  return clean;
}

class AudioController {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private fallbackOsc: OscillatorNode | null = null;
  private fallbackGain: GainNode | null = null;
  private isUsingFallback: boolean = false;
  private fallbackInterval: number | null = null;

  public init() {
    if (!this.audio && typeof window !== "undefined") {
      this.audio = new Audio();
      this.audio.crossOrigin = "anonymous";
    }
  }

  public getAudioElement(): HTMLAudioElement | null {
    if (!this.audio) this.init();
    return this.audio;
  }

  public playTrack(
    url: string,
    onTimeUpdate: (current: number, duration: number) => void,
    onEnded: () => void,
    onErrorFallback?: () => void
  ): Promise<void> {
    this.stop();
    this.init();

    if (!this.audio) return Promise.resolve();

    const streamableUrl = formatAudioUrl(url);
    this.audio.src = streamableUrl;
    this.audio.currentTime = 0;

    this.audio.ontimeupdate = () => {
      if (this.audio) {
        const cur = this.audio.currentTime || 0;
        const dur = this.audio.duration || 180;
        onTimeUpdate(cur, dur);
      }
    };

    this.audio.onended = () => {
      onEnded();
    };

    this.audio.onerror = () => {
      // Graceful fallback to warm romantic chords synthesizer
      this.playSyntheticMelody(onTimeUpdate, onEnded);
      if (onErrorFallback) onErrorFallback();
    };

    return this.audio.play().catch(() => {
      // Autoplay or network restriction
      this.playSyntheticMelody(onTimeUpdate, onEnded);
    });
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.stopFallback();
  }

  public resume(): Promise<void> {
    if (this.isUsingFallback) {
      return Promise.resolve();
    }
    if (this.audio && this.audio.src) {
      return this.audio.play().catch(() => {});
    }
    return Promise.resolve();
  }

  public seek(seconds: number) {
    if (this.audio && !this.isUsingFallback && Number.isFinite(seconds)) {
      this.audio.currentTime = seconds;
    }
  }

  public setVolume(val: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, val));
    }
    if (this.fallbackGain) {
      this.fallbackGain.gain.setValueAtTime(val * 0.15, this.audioCtx?.currentTime || 0);
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.ontimeupdate = null;
      this.audio.onended = null;
      this.audio.onerror = null;
    }
    this.stopFallback();
  }

  private stopFallback() {
    this.isUsingFallback = false;
    if (this.fallbackInterval) {
      window.clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    if (this.fallbackOsc) {
      try {
        this.fallbackOsc.stop();
        this.fallbackOsc.disconnect();
      } catch {}
      this.fallbackOsc = null;
    }
    if (this.fallbackGain) {
      try {
        this.fallbackGain.disconnect();
      } catch {}
      this.fallbackGain = null;
    }
  }

  // Synthesizes a soothing romantic chord progression in case remote audio fails
  private playSyntheticMelody(
    onTimeUpdate: (cur: number, dur: number) => void,
    onEnded: () => void
  ) {
    this.stopFallback();
    this.isUsingFallback = true;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const notes = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66]; // C major gentle romantic arpeggio
      let noteIdx = 0;
      let elapsed = 0;
      const totalDur = 45; // 45s preview

      this.fallbackInterval = window.setInterval(() => {
        if (!this.audioCtx || this.audioCtx.state === "closed") return;
        elapsed += 0.8;
        onTimeUpdate(elapsed, totalDur);

        if (elapsed >= totalDur) {
          this.stopFallback();
          onEnded();
          return;
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(notes[noteIdx % notes.length], this.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.9);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 1.0);

        noteIdx++;
      }, 800);
    } catch {
      // Web Audio not permitted
    }
  }
}

export const globalAudioController = new AudioController();
