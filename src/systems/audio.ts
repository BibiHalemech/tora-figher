import { publicUrl } from "../publicUrl";
import { isMuted } from "./session";

const BONUS_MUSIC_PATH = "assets/audio/fast_bonus.mp3";
const BONUS_MUSIC_START_SEC = 4;

type Voice = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

let context: AudioContext | null = null;
let musicTimer: number | null = null;
let musicStep = 0;
let bonusBuffer: AudioBuffer | null = null;
let bonusSource: AudioBufferSourceNode | null = null;
let bonusGain: GainNode | null = null;
let bonusLoad: Promise<AudioBuffer | null> | null = null;
const voices: Voice[] = [];

function resolveUrl(path: string): string {
  return new URL(publicUrl(path), window.location.href).href;
}

function getContext(): AudioContext | null {
  const Ctor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!context) {
    context = new Ctor();
  }
  return context;
}

function canPlay(): boolean {
  return !isMuted();
}

function dropVoice(voice: Voice): void {
  const index = voices.indexOf(voice);
  if (index >= 0) {
    voices.splice(index, 1);
  }
}

function beep(
  frequency: number,
  peak: number,
  duration: number,
  type: OscillatorType = "square",
  whenOffset = 0,
): void {
  const audio = getContext();
  if (!audio || !canPlay()) {
    return;
  }
  void audio.resume();
  const when = audio.currentTime + whenOffset;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(when);
  oscillator.stop(when + duration + 0.03);
  const voice = { oscillator, gain };
  voices.push(voice);
  oscillator.onended = () => {
    dropVoice(voice);
  };
}

function loadBonusBuffer(): Promise<AudioBuffer | null> {
  if (bonusBuffer) {
    return Promise.resolve(bonusBuffer);
  }
  if (bonusLoad) {
    return bonusLoad;
  }
  const audio = getContext();
  if (!audio) {
    return Promise.resolve(null);
  }
  bonusLoad = fetch(resolveUrl(BONUS_MUSIC_PATH))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`bonus music HTTP ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then((data) => audio.decodeAudioData(data.slice(0)))
    .then((buffer) => {
      bonusBuffer = buffer;
      return buffer;
    })
    .catch(() => {
      bonusLoad = null;
      return null;
    });
  return bonusLoad;
}

function stopBonusSource(): void {
  if (bonusSource) {
    try {
      bonusSource.onended = null;
      bonusSource.stop();
    } catch {
      // Already stopped.
    }
    bonusSource.disconnect();
    bonusSource = null;
  }
  if (bonusGain) {
    bonusGain.disconnect();
    bonusGain = null;
  }
}

function playBonusBuffer(buffer: AudioBuffer): void {
  const audio = getContext();
  if (!audio || !canPlay()) {
    return;
  }
  stopBonusSource();
  void audio.resume();
  const gain = audio.createGain();
  gain.gain.value = 0.6;
  gain.connect(audio.destination);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const startAt = Math.min(BONUS_MUSIC_START_SEC, Math.max(0, buffer.duration - 0.05));
  source.loopStart = startAt;
  source.loopEnd = buffer.duration;
  source.connect(gain);
  source.start(0, startAt);
  bonusSource = source;
  bonusGain = gain;
}

export function unlockAudio(): void {
  const audio = getContext();
  if (audio) {
    void audio.resume();
  }
  void loadBonusBuffer();
}

export function playPickup(): void {
  beep(660, 0.08, 0.08, "sine");
  beep(880, 0.07, 0.1, "sine", 0.06);
  beep(1174, 0.06, 0.14, "sine", 0.12);
}

export function playHit(): void {
  beep(180, 0.09, 0.12, "sawtooth");
  beep(120, 0.07, 0.16, "square", 0.04);
}

export function playBoom(): void {
  beep(90, 0.12, 0.18, "sawtooth");
  beep(220, 0.06, 0.1, "square", 0.03);
}

export function playFreeze(): void {
  beep(980, 0.05, 0.2, "sine");
  beep(740, 0.05, 0.22, "sine", 0.08);
  beep(520, 0.04, 0.28, "triangle", 0.16);
}

export function playFanfare(): void {
  beep(523, 0.07, 0.12, "square");
  beep(659, 0.07, 0.12, "square", 0.1);
  beep(784, 0.08, 0.14, "square", 0.2);
  beep(1046, 0.09, 0.28, "square", 0.32);
}

export function playFailSuccess(): void {
  beep(392, 0.07, 0.14, "triangle");
  beep(330, 0.07, 0.16, "triangle", 0.12);
  beep(262, 0.08, 0.22, "triangle", 0.24);
  beep(523, 0.09, 0.3, "square", 0.42);
}

const MARCH = [392, 392, 523, 392, 587, 523, 392, 330];

export function startBackgroundMusic(): void {
  if (!canPlay() || musicTimer !== null) {
    return;
  }
  const audio = getContext();
  if (!audio) {
    return;
  }
  void audio.resume();
  musicStep = 0;
  const tick = (): void => {
    if (!canPlay()) {
      return;
    }
    const note = MARCH[musicStep % MARCH.length] ?? 392;
    beep(note, 0.028, 0.12, musicStep % 4 === 0 ? "square" : "triangle");
    if (musicStep % 2 === 0) {
      beep(note / 2, 0.018, 0.16, "sine");
    }
    musicStep += 1;
  };
  tick();
  musicTimer = window.setInterval(tick, 220);
}

export function stopBackgroundMusic(): void {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

export function startBonusMusic(): void {
  if (!canPlay()) {
    return;
  }
  stopBackgroundMusic();
  const play = (buffer: AudioBuffer | null): void => {
    if (!buffer || isMuted()) {
      return;
    }
    playBonusBuffer(buffer);
  };
  if (bonusBuffer) {
    play(bonusBuffer);
    return;
  }
  void loadBonusBuffer().then(play);
}

export function stopBonusMusic(): void {
  stopBonusSource();
  startBackgroundMusic();
}

export function setMusicEnabled(enabled: boolean): void {
  if (!enabled) {
    stopBackgroundMusic();
    stopBonusSource();
    return;
  }
  startBackgroundMusic();
}
