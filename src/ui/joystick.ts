import Phaser from "phaser";
import { LAYOUT } from "../config";

export class VirtualJoystick {
  readonly vector = { x: 0, y: 0 };
  active = false;
  pressing = false;

  private readonly thumb: Phaser.GameObjects.Arc;
  private readonly hit: Phaser.GameObjects.Arc;
  private readonly originX: number;
  private readonly originY: number;
  private readonly maxRadius = 70;

  constructor(scene: Phaser.Scene) {
    this.originX = LAYOUT.joystickX;
    this.originY = LAYOUT.joystickY;

    scene.add.circle(this.originX, this.originY, 78, 0x2c2a26, 0.22).setDepth(25);
    this.thumb = scene.add.circle(this.originX, this.originY, 34, 0x2c2a26, 0.45).setDepth(26);
    this.hit = scene.add
      .circle(this.originX, this.originY, 110, 0x000000, 0)
      .setDepth(27)
      .setInteractive();

    this.hit.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.pressing = true;
      this.active = true;
      this.steer(pointer);
    });
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.pressing) {
        this.steer(pointer);
      }
    });
    scene.input.on("pointerup", () => {
      this.reset();
    });
  }

  private steer(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.worldX - this.originX;
    const dy = pointer.worldY - this.originY;
    const len = Math.hypot(dx, dy);
    const clamped = Math.min(len, this.maxRadius);
    const nx = len > 0 ? dx / len : 0;
    const ny = len > 0 ? dy / len : 0;
    this.thumb.setPosition(this.originX + nx * clamped, this.originY + ny * clamped);
    this.vector.x = nx * (clamped / this.maxRadius);
    this.vector.y = ny * (clamped / this.maxRadius);
    this.active = clamped > 6;
  }

  private reset(): void {
    this.pressing = false;
    this.active = false;
    this.vector.x = 0;
    this.vector.y = 0;
    this.thumb.setPosition(this.originX, this.originY);
  }
}
