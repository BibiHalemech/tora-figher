import Phaser from "phaser";
import { FONT_FAMILY, SceneKeys, STAGE_WIDTH, TUNING } from "../config";
import { strings } from "../content/strings.he";
import { loadSession } from "../systems/session";
import { addDimOverlay, addSkyGround } from "../ui/backdrop";

export class StageIntroScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.StageIntro);
  }

  create(): void {
    addSkyGround(this);
    addDimOverlay(this, 0.25);
    const session = loadSession(this);
    const copy = strings.intros[session.stage];

    this.add
      .text(STAGE_WIDTH / 2, 380, copy.title, {
        fontFamily: FONT_FAMILY,
        fontSize: "72px",
        fontStyle: "800",
        color: "#FFF8EE",
        rtl: true,
      })
      .setOrigin(0.5);

    this.add
      .text(STAGE_WIDTH / 2, 520, copy.body, {
        fontFamily: FONT_FAMILY,
        fontSize: "36px",
        fontStyle: "500",
        color: "#FFF8EE",
        align: "center",
        rtl: true,
      })
      .setOrigin(0.5);

    if (session.stage === 1) {
      this.add
        .text(STAGE_WIDTH / 2, 680, strings.recruit, {
          fontFamily: FONT_FAMILY,
          fontSize: "28px",
          fontStyle: "700",
          color: "#FFE066",
          rtl: true,
        })
        .setOrigin(0.5);
    }

    this.time.delayedCall(TUNING.introMs, () => {
      this.scene.start(SceneKeys.Play);
    });
  }
}
