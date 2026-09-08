import Phaser from "phaser";
import {
  CHARACTER_TEXTURE,
  LAYOUT,
  STAGE_WIDTH,
  TUNING,
  type CharacterId,
} from "../config";
import type { VirtualJoystick } from "../ui/joystick";

export type PlayerController = {
  sprite: Phaser.Physics.Arcade.Sprite;
  halo: Phaser.GameObjects.Arc;
  bonusInvincibleUntil: number;
  iframeUntil: number;
  returning: boolean;
};

export function createPlayer(scene: Phaser.Scene, character: CharacterId): PlayerController {
  const sprite = scene.physics.add.sprite(
    LAYOUT.playerStartX,
    LAYOUT.playerStartY,
    CHARACTER_TEXTURE[character],
  );
  sprite.setDepth(8);
  sprite.setCollideWorldBounds(true);
  sprite.setBounce(0);
  sprite.setCircle(TUNING.collisionRadius, 28, 52);
  sprite.setDrag(0);

  const halo = scene.add.circle(sprite.x, sprite.y, 58, 0xffe066, 0);
  halo.setDepth(7);

  scene.tweens.add({
    targets: sprite,
    scaleY: 1.03,
    scaleX: 0.98,
    duration: 420,
    yoyo: true,
    repeat: -1,
    ease: "Sine.InOut",
  });

  return {
    sprite,
    halo,
    bonusInvincibleUntil: 0,
    iframeUntil: 0,
    returning: false,
  };
}

export function isBonusInvincible(player: PlayerController, now: number): boolean {
  return now < player.bonusInvincibleUntil;
}

export function isIframed(player: PlayerController, now: number): boolean {
  return now < player.iframeUntil;
}

export function grantInvincibility(player: PlayerController, now: number, durationMs: number): void {
  player.bonusInvincibleUntil = now + durationMs;
}

export function grantIframes(player: PlayerController, now: number): void {
  player.iframeUntil = now + TUNING.hitIframesMs;
}

export function flingPlayerToStart(
  scene: Phaser.Scene,
  player: PlayerController,
  onComplete: () => void,
): void {
  const sprite = player.sprite;
  const body = sprite.body as Phaser.Physics.Arcade.Body;
  player.returning = true;
  body.setVelocity(0, 0);
  body.enable = false;
  sprite.setCollideWorldBounds(false);

  const fromX = sprite.x;
  const fromY = sprite.y;
  const toX = LAYOUT.playerStartX;
  const toY = LAYOUT.playerStartY;
  const peakY = Math.min(fromY, toY) - 240;
  const spins = 720;

  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: TUNING.hitReturnMs,
    ease: "Sine.Out",
    onUpdate: (tween) => {
      const t = tween.getValue() ?? 0;
      sprite.x = Phaser.Math.Linear(fromX, toX, t);
      sprite.y = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * peakY + t * t * toY;
      sprite.angle = t * spins;
    },
    onComplete: () => {
      sprite.setAngle(0);
      sprite.setPosition(toX, toY);
      sprite.setCollideWorldBounds(true);
      body.enable = true;
      body.setVelocity(0, 0);
      player.returning = false;
      onComplete();
    },
  });
}

export function updatePlayerVisuals(player: PlayerController, now: number, moving: boolean): void {
  player.halo.setPosition(player.sprite.x, player.sprite.y + 8);
  if (player.returning) {
    return;
  }
  const invincible = isBonusInvincible(player, now);
  player.halo.setFillStyle(0xffe066, invincible ? 0.35 : 0);
  player.sprite.setTint(invincible ? 0xfff3a0 : 0xffffff);

  if (isIframed(player, now) && !invincible) {
    player.sprite.setAlpha(Math.sin(now / 50) > 0 ? 1 : 0.35);
  } else {
    player.sprite.setAlpha(1);
  }

  if (moving) {
    player.sprite.setAngle(Math.sin(now / 80) * 4);
  } else {
    player.sprite.setAngle(0);
  }
}

export function steerPlayer(
  scene: Phaser.Scene,
  player: PlayerController,
  joystick: VirtualJoystick | null,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  wasd: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>,
): boolean {
  let vx = 0;
  let vy = 0;

  if (cursors.left.isDown || wasd.A.isDown) {
    vx -= 1;
  }
  if (cursors.right.isDown || wasd.D.isDown) {
    vx += 1;
  }
  if (cursors.up.isDown || wasd.W.isDown) {
    vy -= 1;
  }
  if (cursors.down.isDown || wasd.S.isDown) {
    vy += 1;
  }

  if (joystick && joystick.active) {
    vx = joystick.vector.x;
    vy = joystick.vector.y;
  } else {
    const pointer = scene.input.activePointer;
    if (pointer.isDown && !joystick?.pressing) {
      const dx = pointer.worldX - player.sprite.x;
      const dy = pointer.worldY - player.sprite.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 12) {
        vx = dx / dist;
        vy = dy / dist;
      }
    }
  }

  const len = Math.hypot(vx, vy);
  if (len > 1) {
    vx /= len;
    vy /= len;
  }

  const body = player.sprite.body as Phaser.Physics.Arcade.Body;
  body.setVelocity(vx * TUNING.playerSpeed, vy * TUNING.playerSpeed);

  player.sprite.x = Phaser.Math.Clamp(player.sprite.x, LAYOUT.doorX - 10, STAGE_WIDTH - 70);
  player.sprite.y = Phaser.Math.Clamp(player.sprite.y, LAYOUT.playTop + 40, LAYOUT.playBottom - 20);
  if (vx < -0.15) {
    player.sprite.setFlipX(false);
  } else if (vx > 0.15) {
    player.sprite.setFlipX(true);
  }

  return len > 0.08;
}
