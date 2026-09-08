import Phaser from "phaser";
import { COLORS, LAYOUT, STAGE_HEIGHT, STAGE_WIDTH } from "../config";

export function addSkyGround(scene: Phaser.Scene): void {
  const bg = scene.add.graphics();
  bg.fillGradientStyle(COLORS.skyTop, COLORS.skyTop, COLORS.skyBottom, COLORS.skyBottom, 1);
  bg.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  bg.fillStyle(COLORS.ground, 1);
  bg.fillRect(0, LAYOUT.playBottom - 40, STAGE_WIDTH, STAGE_HEIGHT - (LAYOUT.playBottom - 40));
  bg.fillStyle(COLORS.groundDark, 1);
  bg.fillRect(0, LAYOUT.playBottom - 8, STAGE_WIDTH, 10);

  for (let i = 0; i < 6; i += 1) {
    const cloud = scene.add.ellipse(
      180 + i * 320,
      160 + (i % 2) * 40,
      160,
      60,
      0xffffff,
      0.35,
    );
    cloud.setDepth(0);
  }

  scene.add.rectangle(0, 0, STAGE_WIDTH, 120, 0xfff8ee, 0.55).setOrigin(0).setDepth(15);
}

export function addDimOverlay(scene: Phaser.Scene, alpha = 0.35): void {
  scene.add.rectangle(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, STAGE_WIDTH, STAGE_HEIGHT, 0x2c2a26, alpha);
}
