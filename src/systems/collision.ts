import type Phaser from "phaser";
import type { Obstacle } from "./obstacles";
import type { PlayerController } from "./player";

export function circlesOverlap(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
}

export function playerHitsObstacle(player: PlayerController, obstacle: Obstacle): boolean {
  if (!obstacle.active) {
    return false;
  }
  return circlesOverlap(
    player.sprite.x,
    player.sprite.y + 10,
    30,
    obstacle.sprite.x,
    obstacle.sprite.y,
    48,
  );
}

export function playerHitsSprite(
  player: PlayerController,
  sprite: Phaser.GameObjects.Sprite,
  radius = 36,
): boolean {
  return circlesOverlap(player.sprite.x, player.sprite.y + 10, 30, sprite.x, sprite.y, radius);
}
