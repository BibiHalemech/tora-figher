import { publicUrl } from "../publicUrl";
import { isMuted } from "./session";

const BONUS_MUSIC_URL = publicUrl("assets/audio/fast_bonus.mp3");
const BONUS_MUSIC_START_SEC = 4;

type Voice = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

let context: AudioContext | null = null;
let musicTimer: number | null = null;
let musicStep = 0;
let bonusTrack: HTMLAudioElement | null = null;
const voices: Voice[] = [];

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

export function unlockAudio(): void {
  const audio = getContext();
  if (audio) {
    void audio.resume();
  }
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
  if (!bonusTrack) {
    bonusTrack = new Audio(BONUS_MUSIC_URL);
    bonusTrack.loop = false;
    bonusTrack.volume = 0.6;
    bonusTrack.dataset.bgMusic = "fast-bonus";
    document.body.appendChild(bonusTrack);
    bonusTrack.addEventListener("ended", () => {
      if (!bonusTrack || isMuted()) {
        return;
      }
      bonusTrack.currentTime = BONUS_MUSIC_START_SEC;
      void bonusTrack.play().catch(() => undefined);
    });
  }
  const begin = (): void => {
    if (!bonusTrack) {
      return;
    }
    bonusTrack.currentTime = BONUS_MUSIC_START_SEC;
    void bonusTrack.play().catch(() => {
      // Browser blocked autoplay until a later gesture.
    });
  };
  if (bonusTrack.readyState >= 1) {
    begin();
  } else {
    bonusTrack.addEventListener("loadedmetadata", begin, { once: true });
  }
}

export function stopBonusMusic(): void {
  if (bonusTrack) {
    bonusTrack.pause();
    bonusTrack.currentTime = BONUS_MUSIC_START_SEC;
  }
  startBackgroundMusic();
}

export function setMusicEnabled(enabled: boolean): void {
  if (!enabled) {
    stopBackgroundMusic();
    if (bonusTrack) {
      bonusTrack.pause();
      bonusTrack.currentTime = BONUS_MUSIC_START_SEC;
    }
    return;
  }
  startBackgroundMusic();
}
