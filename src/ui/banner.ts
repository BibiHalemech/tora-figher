import Phaser from "phaser";
import { FONT_FAMILY, LAYOUT, STAGE_WIDTH } from "../config";

export function showBanner(scene: Phaser.Scene, text: string, hold = 1400): Phaser.GameObjects.Text {
  const banner = scene.add
    .text(STAGE_WIDTH / 2, LAYOUT.bannerY, text, {
      fontFamily: FONT_FAMILY,
      fontSize: "36px",
      fontStyle: "700",
      color: "#2C2A26",
      backgroundColor: "#FFF8EE",
      padding: { x: 28, y: 14 },
      align: "center",
      rtl: true,
      wordWrap: { width: 900 },
    })
    .setOrigin(0.5)
    .setDepth(40)
    .setAlpha(0);

  scene.tweens.add({
    targets: banner,
    alpha: 1,
    duration: 140,
    hold,
    yoyo: true,
    onComplete: () => {
      banner.destroy();
    },
  });

  return banner;
}
