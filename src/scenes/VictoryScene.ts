import Phaser from "phaser";
import { FONT_FAMILY, SceneKeys, STAGE_WIDTH } from "../config";
import { strings } from "../content/strings.he";
import { playFanfare } from "../systems/audio";
import { loadSession } from "../systems/session";
import { addDimOverlay, addSkyGround } from "../ui/backdrop";
import { addPillButton } from "../ui/button";

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Victory);
  }

  create(): void {
    addSkyGround(this);
    addDimOverlay(this, 0.3);
    playFanfare();
    const session = loadSession(this);
    const hearts = "❤️ ".repeat(Math.max(0, session.lives)).trim() || "—";

    this.add
      .text(STAGE_WIDTH / 2, 200, strings.victoryTitle, {
        fontFamily: FONT_FAMILY,
        fontSize: "80px",
        fontStyle: "800",
        color: "#FFF8EE",
        rtl: true,
      })
      .setOrigin(0.5);

    this.add
      .text(STAGE_WIDTH / 2, 310, strings.victoryBody, {
        fontFamily: FONT_FAMILY,
        fontSize: "32px",
        fontStyle: "500",
        color: "#FFF8EE",
        rtl: true,
      })
      .setOrigin(0.5);

    const summary = [
      `${strings.character}: ${strings.characterNames[session.character]}`,
      strings.stagesDone,
      `${strings.scoreLabel}: ${session.score}`,
      `${strings.livesLeft}: ${hearts}`,
    ].join("\n");

    this.add
      .text(STAGE_WIDTH / 2, 500, summary, {
        fontFamily: FONT_FAMILY,
        fontSize: "34px",
        fontStyle: "700",
        color: "#FFF8EE",
        align: "center",
        rtl: true,
        lineSpacing: 12,
      })
      .setOrigin(0.5);

    this.add
      .text(STAGE_WIDTH / 2, 700, strings.victoryDone, {
        fontFamily: FONT_FAMILY,
        fontSize: "32px",
        fontStyle: "700",
        color: "#FFE066",
        rtl: true,
      })
      .setOrigin(0.5);

    addPillButton(this, {
      label: strings.playAgain,
      x: STAGE_WIDTH / 2,
      y: 820,
      onClick: () => {
        this.scene.start(SceneKeys.CharacterSelect);
      },
    });
  }
}
