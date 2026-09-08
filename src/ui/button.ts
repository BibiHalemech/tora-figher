import Phaser from "phaser";
import { COLORS, FONT_FAMILY } from "../config";

type PillButtonOptions = {
  label: string;
  x: number;
  y: number;
  width?: number;
  onClick?: () => void;
};

export function addPillButton(
  scene: Phaser.Scene,
  options: PillButtonOptions,
): Phaser.GameObjects.Container {
  const width = options.width ?? 420;
  const height = 88;
  const radius = 44;
  const { label, x, y, onClick } = options;

  const background = scene.add.graphics();
  background.fillStyle(COLORS.charcoal, 1);
  background.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: FONT_FAMILY,
      fontSize: "36px",
      fontStyle: "700",
      color: "#FFF8EE",
      rtl: true,
    })
    .setOrigin(0.5);

  const hit = scene.add
    .rectangle(0, 0, width, height, COLORS.charcoal, 0)
    .setInteractive({ useHandCursor: Boolean(onClick) });

  const container = scene.add.container(x, y, [background, text, hit]);

  if (onClick) {
    hit.on("pointerdown", () => {
      container.setAlpha(0.85);
    });
    hit.on("pointerup", () => {
      container.setAlpha(1);
      onClick();
    });
    hit.on("pointerout", () => {
      container.setAlpha(1);
    });
  }

  return container;
}
