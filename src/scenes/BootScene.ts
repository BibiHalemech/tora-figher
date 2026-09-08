import Phaser from "phaser";
import { FONT_FAMILY, SceneKeys } from "../config";
import { publicUrl } from "../publicUrl";
import { generateAllArt } from "../systems/art";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  preload(): void {
    this.load.image("bonus_invincible", publicUrl("assets/images/goldknopf.png"));
    this.load.image("bonus_freeze", publicUrl("assets/images/bibi.png"));
    this.load.image("obstacle", publicUrl("assets/images/gali.png"));
  }

  create(): void {
    void this.boot();
  }

  private async boot(): Promise<void> {
    await this.waitForFont();
    generateAllArt(this);
    this.scene.start(SceneKeys.Title);
  }

  private async waitForFont(): Promise<void> {
    if (!("fonts" in document)) {
      return;
    }
    try {
      await document.fonts.load(`700 64px ${FONT_FAMILY}`);
      await document.fonts.ready;
    } catch {
      // System fallback is already set on every text style.
    }
  }
}
