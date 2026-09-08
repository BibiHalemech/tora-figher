import Phaser from "phaser";
import { CHARACTER_TEXTURE, FONT_FAMILY, SceneKeys, STAGE_HEIGHT, STAGE_WIDTH } from "../config";
import { strings } from "../content/strings.he";
import { setMusicEnabled, startBackgroundMusic, unlockAudio } from "../systems/audio";
import { isMuted, setMuted } from "../systems/session";
import { addSkyGround } from "../ui/backdrop";
import { addPillButton } from "../ui/button";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Title);
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#7ed0ff");
    addSkyGround(this);
    this.add.image(260, 640, "yeshiva").setScale(0.85);

    const runner = this.add.image(1500, 700, CHARACTER_TEXTURE.torah);
    this.tweens.add({
      targets: runner,
      x: 520,
      duration: 2800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
    this.tweens.add({
      targets: runner,
      y: 680,
      duration: 180,
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(STAGE_WIDTH / 2, 220, strings.title, {
        fontFamily: FONT_FAMILY,
        fontSize: "84px",
        fontStyle: "800",
        color: "#2C2A26",
        rtl: true,
      })
      .setOrigin(0.5);

    this.add
      .text(STAGE_WIDTH / 2, 330, strings.tagline, {
        fontFamily: FONT_FAMILY,
        fontSize: "36px",
        fontStyle: "500",
        color: "#2C2A26",
        rtl: true,
      })
      .setOrigin(0.5);

    addPillButton(this, {
      label: strings.start,
      x: STAGE_WIDTH / 2,
      y: 480,
      onClick: () => {
        unlockAudio();
        startBackgroundMusic();
        this.scene.start(SceneKeys.CharacterSelect);
      },
    });

    const muteLabel = isMuted() ? strings.muteOn : strings.muteOff;
    const mute = addPillButton(this, {
      label: muteLabel,
      x: STAGE_WIDTH - 180,
      y: STAGE_HEIGHT - 70,
      width: 260,
      onClick: () => {
        const next = !isMuted();
        setMuted(next);
        setMusicEnabled(!next);
        const text = mute.getAt(1) as Phaser.GameObjects.Text;
        text.setText(next ? strings.muteOn : strings.muteOff);
      },
    });
  }
}
