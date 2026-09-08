import Phaser from "phaser";
import { LAYOUT, OBSTACLE_KINDS, TUNING, type ObstacleKind } from "../config";
import type { MovementPattern, StageConfig } from "../content/stages";

export type Obstacle = {
  sprite: Phaser.Physics.Arcade.Sprite;
  kind: ObstacleKind;
  pattern: MovementPattern;
  speed: number;
  baseX: number;
  baseY: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  radius: number;
  angle: number;
  direction: number;
  t: number;
  active: boolean;
  homing: boolean;
};

function pick<T>(items: readonly T[]): T {
  return items[Phaser.Math.Between(0, items.length - 1)] as T;
}

function evenSpread(count: number, min: number, max: number): number[] {
  if (count <= 1) {
    return [(min + max) / 2];
  }
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

function portraitScale(sprite: Phaser.GameObjects.Sprite, extra = 1): number {
  const base = sprite.height > 200 ? TUNING.obstaclePortraitHeight / sprite.height : 1;
  return base * extra;
}

function createObstacleSprite(
  scene: Phaser.Scene,
  x: number,
  y: number,
  kind: ObstacleKind,
  extraScale = 1,
): Phaser.Physics.Arcade.Sprite {
  const texture = scene.textures.exists("obstacle") ? "obstacle" : `obstacle_${kind}`;
  const sprite = scene.physics.add.sprite(x, y, texture);
  sprite.setScale(portraitScale(sprite, extraScale));
  sprite.setFlipX(Phaser.Math.Between(0, 1) === 1);
  sprite.setImmovable(true);
  return sprite;
}

export function spawnObstacles(scene: Phaser.Scene, config: StageConfig): Obstacle[] {
  const count = Phaser.Math.Between(config.obstacleCount[0], config.obstacleCount[1]);
  const xs = evenSpread(count, LAYOUT.obstacleMinX, LAYOUT.obstacleMaxX);
  const playTop = LAYOUT.playTop + 30;
  const playBottom = LAYOUT.playBottom - 20;
  const playHeight = playBottom - playTop;

  return xs.map((laneX, index) => {
    const jitter = Phaser.Math.Between(-40, 40);
    const x = Phaser.Math.Clamp(laneX + jitter, LAYOUT.obstacleMinX, LAYOUT.obstacleMaxX);
    const travel = playHeight * (0.38 + Phaser.Math.FloatBetween(0, 0.18));
    const yMin = playTop + Phaser.Math.FloatBetween(0, 1) * Math.max(8, playHeight - travel);
    const yMax = yMin + travel;
    const y = (yMin + yMax) / 2;
    const xTravel = 70 + Phaser.Math.Between(0, 50);
    const pattern = pick(config.movementPatterns);
    const speed = Phaser.Math.FloatBetween(config.speedRange[0], config.speedRange[1]);
    const kind = pick(OBSTACLE_KINDS);
    const radius = 70 + ((index * 13) % 40);

    const sprite = createObstacleSprite(scene, x, y, kind);
    sprite.setDepth(5);

    return {
      sprite,
      kind,
      pattern,
      speed,
      baseX: x,
      baseY: y,
      xMin: x - xTravel,
      xMax: x + xTravel,
      yMin,
      yMax,
      radius,
      angle: Phaser.Math.FloatBetween(0, Math.PI * 2),
      direction: index % 2 === 0 ? 1 : -1,
      t: Phaser.Math.FloatBetween(0, 4),
      active: true,
      homing: false,
    };
  });
}

export function spawnFinisher(
  scene: Phaser.Scene,
  targetX: number,
  targetY: number,
): Obstacle {
  const kind = pick(OBSTACLE_KINDS);
  const startX = Math.max(80, targetX - 380);
  const startY = Phaser.Math.Clamp(
    targetY + Phaser.Math.Between(-80, 80),
    LAYOUT.playTop + 40,
    LAYOUT.playBottom - 40,
  );
  const sprite = createObstacleSprite(scene, startX, startY, kind, 1.2);
  sprite.setDepth(9);

  scene.tweens.add({
    targets: sprite,
    scaleX: sprite.scaleX * 1.12,
    scaleY: sprite.scaleY * 1.12,
    duration: 120,
    yoyo: true,
    repeat: 3,
  });

  return {
    sprite,
    kind,
    pattern: "HORIZONTAL",
    speed: 680,
    baseX: startX,
    baseY: startY,
    xMin: startX,
    xMax: startX,
    yMin: startY,
    yMax: startY,
    radius: 40,
    angle: 0,
    direction: 1,
    t: 0,
    active: true,
    homing: true,
  };
}

export function updateObstacles(
  obstacles: Obstacle[],
  dt: number,
  frozen: boolean,
  homeTarget?: { x: number; y: number },
): void {
  for (const obstacle of obstacles) {
    if (!obstacle.active) {
      continue;
    }
    obstacle.t += dt;
    const sprite = obstacle.sprite;
    const speed = obstacle.speed;

    if (obstacle.homing && homeTarget) {
      const dx = homeTarget.x - sprite.x;
      const dy = homeTarget.y - sprite.y;
      const dist = Math.hypot(dx, dy) || 1;
      sprite.x += (dx / dist) * speed * dt;
      sprite.y += (dy / dist) * speed * dt;
      continue;
    }

    if (frozen) {
      continue;
    }

    switch (obstacle.pattern) {
      case "VERTICAL":
        sprite.y += obstacle.direction * speed * dt;
        bounceY(obstacle);
        break;
      case "HORIZONTAL":
        sprite.x += obstacle.direction * speed * dt;
        bounceX(obstacle);
        break;
      case "DIAGONAL":
        sprite.x += obstacle.direction * speed * dt * 0.65;
        sprite.y += obstacle.direction * speed * dt;
        bounceX(obstacle);
        bounceY(obstacle);
        break;
      case "SINE_WAVE":
        sprite.y += obstacle.direction * speed * dt;
        sprite.x = obstacle.baseX + Math.sin(obstacle.t * 2.2) * 70;
        bounceY(obstacle);
        break;
      case "CIRCLE":
        obstacle.angle += (speed / Math.max(40, obstacle.radius)) * dt;
        sprite.x = obstacle.baseX + Math.cos(obstacle.angle) * obstacle.radius;
        sprite.y = obstacle.baseY + Math.sin(obstacle.angle) * (obstacle.radius * 0.7);
        break;
      case "FIGURE_8":
        obstacle.angle += (speed / 90) * dt;
        sprite.x = obstacle.baseX + Math.sin(obstacle.angle) * obstacle.radius;
        sprite.y = obstacle.baseY + Math.sin(obstacle.angle * 2) * (obstacle.radius * 0.5);
        break;
      case "PATROL": {
        const cycle = 4;
        const phase = (obstacle.t % cycle) / cycle;
        if (phase < 0.25) {
          sprite.x = Phaser.Math.Linear(obstacle.xMin, obstacle.xMax, phase / 0.25);
          sprite.y = obstacle.yMin;
        } else if (phase < 0.5) {
          sprite.x = obstacle.xMax;
          sprite.y = Phaser.Math.Linear(obstacle.yMin, obstacle.yMax, (phase - 0.25) / 0.25);
        } else if (phase < 0.75) {
          sprite.x = Phaser.Math.Linear(obstacle.xMax, obstacle.xMin, (phase - 0.5) / 0.25);
          sprite.y = obstacle.yMax;
        } else {
          sprite.x = obstacle.xMin;
          sprite.y = Phaser.Math.Linear(obstacle.yMax, obstacle.yMin, (phase - 0.75) / 0.25);
        }
        break;
      }
    }

    sprite.x = Phaser.Math.Clamp(sprite.x, LAYOUT.obstacleMinX - 80, LAYOUT.obstacleMaxX + 80);
    sprite.y = Phaser.Math.Clamp(sprite.y, LAYOUT.playTop, LAYOUT.playBottom);
  }
}

function bounceY(obstacle: Obstacle): void {
  if (obstacle.sprite.y <= obstacle.yMin) {
    obstacle.sprite.y = obstacle.yMin;
    obstacle.direction = 1;
  } else if (obstacle.sprite.y >= obstacle.yMax) {
    obstacle.sprite.y = obstacle.yMax;
    obstacle.direction = -1;
  }
}

function bounceX(obstacle: Obstacle): void {
  if (obstacle.sprite.x <= obstacle.xMin) {
    obstacle.sprite.x = obstacle.xMin;
    obstacle.direction = 1;
  } else if (obstacle.sprite.x >= obstacle.xMax) {
    obstacle.sprite.x = obstacle.xMax;
    obstacle.direction = -1;
  }
}

export function setObstaclesFrozen(obstacles: Obstacle[], frozen: boolean): void {
  for (const obstacle of obstacles) {
    if (!obstacle.active) {
      continue;
    }
    obstacle.sprite.setTint(frozen ? 0x7fd7ff : 0xffffff);
    obstacle.sprite.setAlpha(frozen ? 0.85 : 1);
  }
}

export function kickObstacleOffscreen(
  scene: Phaser.Scene,
  obstacle: Obstacle,
  fromX: number,
  fromY: number,
): void {
  if (!obstacle.active) {
    return;
  }
  obstacle.active = false;
  const sprite = obstacle.sprite;
  scene.tweens.killTweensOf(sprite);
  sprite.setDepth(12);

  const body = sprite.body as Phaser.Physics.Arcade.Body | undefined;
  body?.setEnable(false);

  let nx = sprite.x - fromX;
  let ny = sprite.y - fromY;
  const dist = Math.hypot(nx, ny) || 1;
  nx /= dist;
  ny /= dist;
  ny = Math.min(ny, -0.25) - 0.7;
  const kickLen = Math.hypot(nx, ny) || 1;
  nx /= kickLen;
  ny /= kickLen;

  const travel = 1500;
  const targetX = sprite.x + nx * travel;
  const targetY = Math.min(sprite.y + ny * travel, -220);
  const spin = (nx >= 0 ? 1 : -1) * Phaser.Math.Between(480, 720);
  const startScaleX = sprite.scaleX;
  const startScaleY = sprite.scaleY;

  scene.tweens.add({
    targets: sprite,
    scaleX: startScaleX * 1.2,
    scaleY: startScaleY * 0.78,
    duration: 55,
    onComplete: () => {
      scene.tweens.add({
        targets: sprite,
        x: targetX,
        y: targetY,
        angle: sprite.angle + spin,
        scaleX: startScaleX * 0.72,
        scaleY: startScaleY * 0.72,
        duration: 480,
        ease: "Cubic.Out",
        onComplete: () => {
          sprite.disableBody(true, true);
        },
      });
    },
  });
}

export function flashObstacle(scene: Phaser.Scene, obstacle: Obstacle): void {
  scene.tweens.add({
    targets: obstacle.sprite,
    alpha: 0.2,
    duration: 70,
    yoyo: true,
    repeat: 2,
  });
}
