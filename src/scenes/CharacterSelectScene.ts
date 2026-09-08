import Phaser from "phaser";
import {
  CHARACTER_TEXTURE,
  COLORS,
  FONT_FAMILY,
  SceneKeys,
  STAGE_WIDTH,
  type CharacterId,
} from "../config";
import { strings } from "../content/strings.he";
import { startBackgroundMusic, unlockAudio } from "../systems/audio";
import { startRun } from "../systems/session";
import { addSkyGround } from "../ui/backdrop";
import { addPillButton } from "../ui/button";

export class CharacterSelectScene extends Phaser.Scene {
  private selected: CharacterId = "torah";
  private cards: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super(SceneKeys.CharacterSelect);
  }

  create(): void {
    addSkyGround(this);

    this.add
      .text(STAGE_WIDTH / 2, 120, strings.selectTitle, {
        fontFamily: FONT_FAMILY,
        fontSize: "56px",
        fontStyle: "800",
        color: "#2C2A26",
        rtl: true,
      })
      .setOrigin(0.5);

    const slots = [
      { id: "torah" as const, x: 420 },
      { id: "tefillin" as const, x: 960 },
      { id: "yeshiva" as const, x: 1500 },
    ];

    this.cards = [];
    for (const slot of slots) {
      const plate = this.add
        .rectangle(slot.x, 480, 360, 460, COLORS.paper)
        .setStrokeStyle(8, slot.id === this.selected ? COLORS.gold : COLORS.charcoal)
        .setInteractive({ useHandCursor: true });
      this.cards.push(plate);

      this.add.image(slot.x, 380, CHARACTER_TEXTURE[slot.id]).setScale(1.15);
      this.add
        .text(slot.x, 560, strings.characterNames[slot.id], {
          fontFamily: FONT_FAMILY,
          fontSize: "32px",
          fontStyle: "700",
          color: "#2C2A26",
          rtl: true,
        })
        .setOrigin(0.5);
      this.add
        .text(slot.x, 620, strings.characterBlurb[slot.id], {
          fontFamily: FONT_FAMILY,
          fontSize: "22px",
          fontStyle: "500",
          color: "#5E6A73",
          rtl: true,
        })
        .setOrigin(0.5);

      plate.on("pointerup", () => {
        this.selected = slot.id;
        this.refreshCards();
      });
    }

    addPillButton(this, {
      label: strings.choose,
      x: STAGE_WIDTH / 2,
      y: 860,
      onClick: () => {
        unlockAudio();
        startBackgroundMusic();
        startRun(this, this.selected);
        this.scene.start(SceneKeys.StageIntro);
      },
    });

  }

  private refreshCards(): void {
    const ids: CharacterId[] = ["torah", "tefillin", "yeshiva"];
    this.cards.forEach((card, index) => {
      const id = ids[index];
      card.setStrokeStyle(8, id === this.selected ? COLORS.gold : COLORS.charcoal);
    });
  }
}
