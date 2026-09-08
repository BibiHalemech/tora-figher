import { LAYOUT } from "../config";
import type { StageConfig } from "../content/stages";

export function travelProgress(playerX: number): number {
  const start = LAYOUT.playerStartX;
  const end = LAYOUT.doorX;
  return Math.min(1, Math.max(0, (start - playerX) / (start - end)));
}

export function rollFailProgress(config: StageConfig): number | null {
  const range = config.failProgressRange;
  if (!range) {
    return null;
  }
  const [min, max] = range;
  return min + Math.random() * (max - min);
}

export function failWorldX(progress: number): number {
  const start = LAYOUT.playerStartX;
  const end = LAYOUT.doorX;
  return start - progress * (start - end);
}
