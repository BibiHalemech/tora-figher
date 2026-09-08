import Phaser from "phaser";
import { TUNING } from "../config";
import type { BonusType } from "../content/stages";
import type { PlayerController } from "./player";

export type FlyingBonus = {
  sprite: Phaser.Physics.Arcade.Sprite;
  type: BonusType;
  collected: boolean;
  collectRadius: number;
};

export function spawnBonus(
  scene: Phaser.Scene,
  type: BonusType,
  player: PlayerController,
): FlyingBonus {
  const texture = type === "INVINCIBILITY" ? "bonus_invincible" : "bonus_freeze";
  const x = player.sprite.x - 380;
  const y = player.sprite.y + Phaser.Math.Between(-140, 140);
  const sprite = scene.physics.add.sprite(x, y, texture);
  sprite.setDepth(6);

  const baseScale = TUNING.bonusPortraitHeight / sprite.height;
  sprite.setScale(baseScale);
  sprite.setCircle(sprite.width * 0.38, sprite.width * 0.12, sprite.height * 0.18);

  scene.tweens.add({
    targets: sprite,
    scaleX: baseScale * 1.08,
    scaleY: baseScale * 1.08,
    duration: 280,
    yoyo: true,
    repeat: -1,
  });

  return { sprite, type, collected: false, collectRadius: 72 };
}

export function updateBonus(bonus: FlyingBonus | null, player: PlayerController, dt: number): void {
  if (!bonus || bonus.collected) {
    return;
  }
  const dx = player.sprite.x - bonus.sprite.x;
  const dy = player.sprite.y - bonus.sprite.y;
  const dist = Math.hypot(dx, dy) || 1;
  bonus.sprite.x += (dx / dist) * TUNING.bonusFlySpeed * dt;
  bonus.sprite.y += (dy / dist) * TUNING.bonusFlySpeed * dt;
}

export function collectBonus(scene: Phaser.Scene, bonus: FlyingBonus): void {
  bonus.collected = true;
  scene.tweens.add({
    targets: bonus.sprite,
    scale: 1.8,
    alpha: 0,
    duration: 200,
    onComplete: () => {
      bonus.sprite.disableBody(true, true);
    },
  });
}
