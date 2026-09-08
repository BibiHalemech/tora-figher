import Phaser from "phaser";
import { FONT_FAMILY, SceneKeys, STAGE_WIDTH } from "../config";
import { strings } from "../content/strings.he";
import { playFanfare } from "../systems/audio";
import { loadSession, saveSession } from "../systems/session";
import type { StageNumber } from "../content/stages";
import { addDimOverlay, addSkyGround } from "../ui/backdrop";
import { addPillButton } from "../ui/button";

type StageCompleteData = {
  failSuccess?: boolean;
};

export class StageCompleteScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.StageComplete);
  }

  create(data?: StageCompleteData): void {
    addSkyGround(this);
    addDimOverlay(this, 0.28);
    playFanfare();

    const fail = Boolean(data?.failSuccess);
    const title = fail ? strings.failSuccessAlt : strings.stageCompleteTitle;
    const body = fail ? strings.failPointReached : strings.stageCompleteBody;

    this.add
      .text(STAGE_WIDTH / 2, 280, title, {
        fontFamily: FONT_FAMILY,
        fontSize: "72px",
        fontStyle: "800",
        color: "#FFF8EE",
        rtl: true,
      })
      .setOrigin(0.5);

    this.add
      .text(STAGE_WIDTH / 2, 400, body, {
        fontFamily: FONT_FAMILY,
        fontSize: "34px",
        fontStyle: "500",
        color: "#FFF8EE",
        align: "center",
        rtl: true,
      })
      .setOrigin(0.5);

    if (fail) {
      this.add
        .text(STAGE_WIDTH / 2, 470, strings.missionComplete, {
          fontFamily: FONT_FAMILY,
          fontSize: "28px",
          fontStyle: "700",
          color: "#FFE066",
          rtl: true,
        })
        .setOrigin(0.5);
    }

    this.add
      .text(STAGE_WIDTH / 2, 560, strings.plusOne, {
        fontFamily: FONT_FAMILY,
        fontSize: "40px",
        fontStyle: "800",
        color: "#FFE066",
        rtl: true,
      })
      .setOrigin(0.5);

    addPillButton(this, {
      label: strings.continue,
      x: STAGE_WIDTH / 2,
      y: 720,
      onClick: () => {
        const session = loadSession(this);
        if (session.stage >= 4) {
          this.scene.start(SceneKeys.Victory);
          return;
        }
        session.stage = (session.stage + 1) as StageNumber;
        saveSession(this, session);
        this.scene.start(SceneKeys.StageIntro);
      },
    });
  }
}
