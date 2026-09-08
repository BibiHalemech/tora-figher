import Phaser from "phaser";
import { FONT_FAMILY, SceneKeys, STAGE_WIDTH } from "../config";
import { strings } from "../content/strings.he";
import { loadSession, startRun } from "../systems/session";
import { addDimOverlay, addSkyGround } from "../ui/backdrop";
import { addPillButton } from "../ui/button";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.GameOver);
  }

  create(): void {
    addSkyGround(this);
    addDimOverlay(this, 0.45);
    const session = loadSession(this);

    this.add
      .text(STAGE_WIDTH / 2, 260, strings.gameOver, {
        fontFamily: FONT_FAMILY,
        fontSize: "80px",
        fontStyle: "800",
        color: "#FFF8EE",
      })
      .setOrigin(0.5);

    this.add
      .text(STAGE_WIDTH / 2, 380, strings.gameOverBody, {
        fontFamily: FONT_FAMILY,
        fontSize: "36px",
        fontStyle: "700",
        color: "#FFF8EE",
        rtl: true,
      })
      .setOrigin(0.5);

    this.add
      .text(STAGE_WIDTH / 2, 450, `${strings.contributionStopped}\n${strings.tryAgain}`, {
        fontFamily: FONT_FAMILY,
        fontSize: "30px",
        fontStyle: "500",
        color: "#FFF8EE",
        align: "center",
        rtl: true,
      })
      .setOrigin(0.5);

    this.add
      .text(STAGE_WIDTH / 2, 560, strings.reachedYeshivas(session.score), {
        fontFamily: FONT_FAMILY,
        fontSize: "34px",
        fontStyle: "700",
        color: "#FFE066",
        rtl: true,
      })
      .setOrigin(0.5);

    addPillButton(this, {
      label: strings.playAgain,
      x: STAGE_WIDTH / 2,
      y: 700,
      onClick: () => {
        startRun(this, session.character);
        this.scene.start(SceneKeys.StageIntro);
      },
    });

    addPillButton(this, {
      label: strings.backToMenu,
      x: STAGE_WIDTH / 2,
      y: 810,
      onClick: () => {
        this.scene.start(SceneKeys.Title);
      },
    });
  }
}
