import type Phaser from "phaser";
import { TUNING, type CharacterId } from "../config";
import type { StageNumber } from "../content/stages";

export const SESSION_KEY = "gameSession";

export type GameSession = {
  character: CharacterId;
  lives: number;
  score: number;
  stage: StageNumber;
};

export function emptySession(character: CharacterId = "torah"): GameSession {
  return {
    character,
    lives: TUNING.startingLives,
    score: 0,
    stage: 1,
  };
}

export function saveSession(scene: Phaser.Scene, session: GameSession): void {
  scene.game.registry.set(SESSION_KEY, session);
}

export function loadSession(scene: Phaser.Scene): GameSession {
  const stored = scene.game.registry.get(SESSION_KEY) as GameSession | undefined;
  if (!stored || !stored.character) {
    const fresh = emptySession();
    saveSession(scene, fresh);
    return fresh;
  }
  return stored;
}

export function startRun(scene: Phaser.Scene, character: CharacterId): GameSession {
  const session = emptySession(character);
  saveSession(scene, session);
  return session;
}

const MUTE_KEY = "tora-fighter-muted";

export function isMuted(): boolean {
  return window.localStorage.getItem(MUTE_KEY) === "1";
}

export function setMuted(muted: boolean): void {
  window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}
