import type Phaser from "phaser";
import type { CharacterId, ObstacleKind } from "../config";

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

function addTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: DrawFn): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const texture = scene.textures.createCanvas(key, w, h);
  if (!texture) {
    return;
  }
  draw(texture.getContext(), w, h);
  texture.refresh();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function drawBoy(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  variant: CharacterId,
): void {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  ctx.fillStyle = "rgba(40, 30, 10, 0.18)";
  ellipse(ctx, cx, h - 14, 38, 9);
  ctx.fill();

  ctx.fillStyle = "#1c1c1c";
  roundRect(ctx, cx - 34, 78, 68, 72, 16);
  ctx.fill();

  ctx.fillStyle = "#fff8ee";
  roundRect(ctx, cx - 16, 84, 32, 34, 6);
  ctx.fill();

  ctx.fillStyle = "#1c1c1c";
  roundRect(ctx, cx - 30, 148, 22, 28, 6);
  ctx.fill();
  roundRect(ctx, cx + 8, 148, 22, 28, 6);
  ctx.fill();

  ctx.fillStyle = "#3a2a18";
  roundRect(ctx, cx - 28, 172, 20, 10, 3);
  ctx.fill();
  roundRect(ctx, cx + 10, 172, 20, 10, 3);
  ctx.fill();

  ctx.fillStyle = "#f2c29b";
  ellipse(ctx, cx, 52, 28, 30);
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ellipse(ctx, cx, 28, 30, 16);
  ctx.fill();
  ctx.fillRect(cx - 30, 28, 60, 10);

  ctx.fillStyle = "#2a1c10";
  ellipse(ctx, cx, 78, 22, 14);
  ctx.fill();
  ctx.fillStyle = "#f2c29b";
  ellipse(ctx, cx, 66, 14, 8);
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(cx - 16, 48, 12, 3);
  ctx.fillRect(cx + 4, 48, 12, 3);
  ctx.fillStyle = "#2a1c10";
  ellipse(ctx, cx - 10, 58, 3, 4);
  ctx.fill();
  ellipse(ctx, cx + 10, 58, 3, 4);
  ctx.fill();

  if (variant === "torah") {
    ctx.fillStyle = "#c9a227";
    roundRect(ctx, cx + 22, 92, 28, 36, 4);
    ctx.fill();
    ctx.strokeStyle = "#7a5a10";
    ctx.lineWidth = 3;
    roundRect(ctx, cx + 22, 92, 28, 36, 4);
    ctx.stroke();
    ctx.fillStyle = "#fff8ee";
    ctx.font = "bold 16px Heebo, Arial";
    ctx.textAlign = "center";
    ctx.fillText("ת", cx + 36, 116);
    ctx.fillStyle = "#f2c29b";
    roundRect(ctx, cx + 18, 108, 12, 16, 4);
    ctx.fill();
  }

  if (variant === "tefillin") {
    ctx.fillStyle = "#1a1a1a";
    roundRect(ctx, cx - 48, 96, 26, 32, 6);
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3;
    roundRect(ctx, cx - 48, 96, 26, 32, 6);
    ctx.stroke();
    ctx.fillStyle = "#ffe066";
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(cx - 35, 88, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f2c29b";
    roundRect(ctx, cx - 38, 112, 12, 16, 4);
    ctx.fill();
  }

  if (variant === "yeshiva") {
    ctx.fillStyle = "#3d4a22";
    roundRect(ctx, cx - 50, 88, 24, 40, 6);
    ctx.fill();
    ctx.fillStyle = "#6b7a3a";
    roundRect(ctx, cx - 54, 84, 32, 10, 3);
    ctx.fill();
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(cx - 48, 100, 20, 3);
    ctx.fillStyle = "#8b5a2b";
    roundRect(ctx, cx + 24, 100, 22, 18, 3);
    ctx.fill();
    ctx.fillStyle = "#fff8ee";
    ctx.fillRect(cx + 27, 104, 16, 3);
    ctx.fillRect(cx + 27, 110, 16, 3);
  }
}

function drawYeshiva(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "rgba(40, 30, 10, 0.2)";
  ellipse(ctx, w / 2, h - 18, 130, 14);
  ctx.fill();

  ctx.fillStyle = "#f3ddb0";
  roundRect(ctx, 30, 90, w - 60, h - 120, 8);
  ctx.fill();
  ctx.strokeStyle = "#8a6a3a";
  ctx.lineWidth = 5;
  roundRect(ctx, 30, 90, w - 60, h - 120, 8);
  ctx.stroke();

  ctx.fillStyle = "#c44";
  ctx.beginPath();
  ctx.moveTo(16, 96);
  ctx.lineTo(w / 2, 18);
  ctx.lineTo(w - 16, 96);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#7a2a2a";
  ctx.stroke();

  ctx.fillStyle = "#fff3c4";
  roundRect(ctx, 54, 8, w - 108, 36, 6);
  ctx.fill();
  ctx.fillStyle = "#2c2a26";
  ctx.font = "bold 18px Heebo, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ישיבת אור הדף", w / 2, 26);

  const windows = [
    [58, 130],
    [128, 130],
    [198, 130],
    [58, 200],
    [198, 200],
  ];
  for (const [x, y] of windows) {
    ctx.fillStyle = "#8fd4ff";
    roundRect(ctx, x, y, 44, 44, 4);
    ctx.fill();
    ctx.strokeStyle = "#5a4030";
    ctx.lineWidth = 3;
    roundRect(ctx, x, y, 44, 44, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 22, y);
    ctx.lineTo(x + 22, y + 44);
    ctx.moveTo(x, y + 22);
    ctx.lineTo(x + 44, y + 22);
    ctx.stroke();
  }

  ctx.fillStyle = "#6b3d22";
  roundRect(ctx, 118, 250, 84, 110, 6);
  ctx.fill();
  ctx.fillStyle = "#f4c542";
  ctx.beginPath();
  ctx.arc(188, 310, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff8ee";
  roundRect(ctx, 70, 368, 180, 28, 6);
  ctx.fill();
  ctx.fillStyle = "#2c2a26";
  ctx.font = "bold 16px Heebo, Arial";
  ctx.fillText("ברוכים הבאים", w / 2, 382);

  ctx.fillStyle = "#d4483a";
  roundRect(ctx, 40, 300, 28, 52, 4);
  ctx.fill();
  ctx.fillStyle = "#2c2a26";
  ctx.fillRect(48, 308, 12, 20);
}

function drawHelmet(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#4d5c2c";
  ellipse(ctx, w / 2, h / 2 + 6, 34, 22);
  ctx.fill();
  ctx.fillStyle = "#6b7a3a";
  ellipse(ctx, w / 2, h / 2 - 4, 28, 20);
  ctx.fill();
  ctx.fillStyle = "#d4483a";
  ctx.fillRect(w / 2 - 18, h / 2 - 2, 36, 6);
}

function drawTank(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#3d4a22";
  roundRect(ctx, 10, 38, 76, 28, 6);
  ctx.fill();
  ctx.fillStyle = "#6b7a3a";
  roundRect(ctx, 22, 18, 44, 26, 5);
  ctx.fill();
  ctx.fillStyle = "#2c2a26";
  ctx.fillRect(62, 24, 28, 7);
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(24, 68, 10, 0, Math.PI * 2);
  ctx.arc(48, 68, 10, 0, Math.PI * 2);
  ctx.arc(72, 68, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d4483a";
  ctx.fillRect(28, 22, 10, 10);
}

function drawDrone(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#2c2a26";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(12, 18);
  ctx.lineTo(w - 12, h - 18);
  ctx.moveTo(w - 12, 18);
  ctx.lineTo(12, h - 18);
  ctx.stroke();
  ctx.fillStyle = "#5e6a73";
  ellipse(ctx, w / 2, h / 2, 16, 12);
  ctx.fill();
  ctx.fillStyle = "#d4483a";
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2c2a26";
  for (const [x, y] of [
    [14, 16],
    [w - 14, 16],
    [14, h - 16],
    [w - 14, h - 16],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBullet(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#d4483a";
  ctx.beginPath();
  ctx.moveTo(w / 2, 8);
  ctx.lineTo(w - 14, h - 12);
  ctx.lineTo(14, h - 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff8ee";
  ctx.font = "bold 28px Heebo, Arial";
  ctx.textAlign = "center";
  ctx.fillText("!", w / 2, h / 2 + 10);
}

function drawBlob(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#d4483a";
  roundRect(ctx, 10, 10, w - 20, h - 20, 16);
  ctx.fill();
  ctx.strokeStyle = "#fff8ee";
  ctx.lineWidth = 6;
  ctx.setLineDash([10, 8]);
  roundRect(ctx, 18, 18, w - 36, h - 36, 12);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawMedal(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#d4483a";
  ctx.beginPath();
  ctx.moveTo(w / 2 - 10, 8);
  ctx.lineTo(w / 2 + 16, 8);
  ctx.lineTo(w / 2 + 4, 36);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2c4a8a";
  ctx.beginPath();
  ctx.moveTo(w / 2 - 16, 8);
  ctx.lineTo(w / 2 + 8, 8);
  ctx.lineTo(w / 2 - 4, 36);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f4c542";
  ctx.beginPath();
  ctx.arc(w / 2, 52, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b8860b";
  ctx.beginPath();
  ctx.arc(w / 2, 52, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawBonus(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  label: string,
  fill: string,
  glow: string,
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff8ee";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#2c2a26";
  ctx.font = "bold 16px Heebo, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, w / 2, h / 2);
}

function drawHeart(ctx: CanvasRenderingContext2D, w: number, h: number, full: boolean): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = full ? "#d4483a" : "#c8b8b0";
  ctx.beginPath();
  const x = w / 2;
  const y = h / 2 + 4;
  ctx.moveTo(x, y + 14);
  ctx.bezierCurveTo(x - 28, y - 4, x - 16, y - 24, x, y - 10);
  ctx.bezierCurveTo(x + 16, y - 24, x + 28, y - 4, x, y + 14);
  ctx.fill();
  if (full) {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(x - 8, y - 8, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

const OBSTACLE_DRAW: Record<ObstacleKind, DrawFn> = {
  helmet: drawHelmet,
  tank: drawTank,
  drone: drawDrone,
  bullet: drawBullet,
  blob: drawBlob,
  medal: drawMedal,
};

export function generateAllArt(scene: Phaser.Scene): void {
  addTexture(scene, "player_torah", 120, 190, (ctx, w, h) => drawBoy(ctx, w, h, "torah"));
  addTexture(scene, "player_tefillin", 120, 190, (ctx, w, h) => drawBoy(ctx, w, h, "tefillin"));
  addTexture(scene, "player_yeshiva", 120, 190, (ctx, w, h) => drawBoy(ctx, w, h, "yeshiva"));
  addTexture(scene, "yeshiva", 320, 420, drawYeshiva);

  if (!scene.textures.exists("obstacle")) {
    for (const [kind, draw] of Object.entries(OBSTACLE_DRAW) as [ObstacleKind, DrawFn][]) {
      addTexture(scene, `obstacle_${kind}`, 96, 96, draw);
    }
  }

  if (!scene.textures.exists("bonus_invincible")) {
    addTexture(scene, "bonus_invincible", 88, 88, (ctx, w, h) =>
      drawBonus(ctx, w, h, "פטור!", "#f4c542", "#ffe066"),
    );
  }
  if (!scene.textures.exists("bonus_freeze")) {
    addTexture(scene, "bonus_freeze", 88, 88, (ctx, w, h) =>
      drawBonus(ctx, w, h, "הקפאה", "#7fd7ff", "#c8f0ff"),
    );
  }
  addTexture(scene, "heart_full", 48, 48, (ctx, w, h) => drawHeart(ctx, w, h, true));
  addTexture(scene, "heart_empty", 48, 48, (ctx, w, h) => drawHeart(ctx, w, h, false));
}
