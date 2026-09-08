import Phaser from "phaser";
import { FONT_FAMILY, LAYOUT, STAGE_WIDTH, TUNING } from "../config";
import { strings } from "../content/strings.he";
import type { GameSession } from "../systems/session";

export class Hud {
  private readonly hearts: Phaser.GameObjects.Image[] = [];
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly effectText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, session: GameSession) {
    scene.add
      .text(48, LAYOUT.hudY, strings.stageLabel(session.stage), {
        fontFamily: FONT_FAMILY,
        fontSize: "32px",
        fontStyle: "700",
        color: "#2C2A26",
        rtl: true,
      })
      .setOrigin(0, 0.5)
      .setDepth(20);

    scene.add
      .text(STAGE_WIDTH / 2, LAYOUT.hudY, strings.gameTitleHud, {
        fontFamily: FONT_FAMILY,
        fontSize: "36px",
        fontStyle: "800",
        color: "#2C2A26",
        rtl: true,
      })
      .setOrigin(0.5)
      .setDepth(20);

    const right = STAGE_WIDTH - 48;
    this.scoreText = scene.add
      .text(right, LAYOUT.hudY + 28, `${strings.scoreLabel}: ${session.score}`, {
        fontFamily: FONT_FAMILY,
        fontSize: "26px",
        fontStyle: "700",
        color: "#2C2A26",
        rtl: true,
      })
      .setOrigin(1, 0.5)
      .setDepth(20);

    for (let i = 0; i < TUNING.startingLives; i += 1) {
      const heart = scene.add
        .image(right - (TUNING.startingLives - 1 - i) * 52, LAYOUT.hudY - 10, "heart_full")
        .setOrigin(1, 0.5)
        .setDepth(20);
      this.hearts.push(heart);
    }
    this.setLives(session.lives);

    this.effectText = scene.add
      .text(STAGE_WIDTH / 2, 108, "", {
        fontFamily: FONT_FAMILY,
        fontSize: "26px",
        fontStyle: "700",
        color: "#2C2A26",
        rtl: true,
      })
      .setOrigin(0.5)
      .setDepth(20);
  }

  setLives(lives: number): void {
    this.hearts.forEach((heart, index) => {
      heart.setTexture(index < lives ? "heart_full" : "heart_empty");
    });
  }

  setScore(score: number): void {
    this.scoreText.setText(`${strings.scoreLabel}: ${score}`);
  }

  setEffect(label: string): void {
    this.effectText.setText(label);
  }
}
