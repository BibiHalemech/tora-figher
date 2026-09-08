import Phaser from "phaser";
import { COLORS, LAYOUT, SceneKeys, STAGE_WIDTH, TUNING } from "../config";
import { getStage } from "../content/stages";
import { strings } from "../content/strings.he";
import {
  playBoom,
  playFailSuccess,
  playFreeze,
  playHit,
  playPickup,
  startBonusMusic,
  stopBonusMusic,
} from "../systems/audio";
import { collectBonus, spawnBonus, updateBonus, type FlyingBonus } from "../systems/bonus";
import { playerHitsObstacle, playerHitsSprite } from "../systems/collision";
import {
  flashObstacle,
  kickObstacleOffscreen,
  setObstaclesFrozen,
  spawnFinisher,
  spawnObstacles,
  updateObstacles,
  type Obstacle,
} from "../systems/obstacles";
import {
  createPlayer,
  flingPlayerToStart,
  grantIframes,
  grantInvincibility,
  isBonusInvincible,
  isIframed,
  steerPlayer,
  updatePlayerVisuals,
  type PlayerController,
} from "../systems/player";
import { loadSession, saveSession } from "../systems/session";
import { rollFailProgress, travelProgress } from "../systems/stageSpawner";
import { addSkyGround } from "../ui/backdrop";
import { showBanner } from "../ui/banner";
import { Hud } from "../ui/hud";
import { VirtualJoystick } from "../ui/joystick";

export class PlayScene extends Phaser.Scene {
  private player!: PlayerController;
  private obstacles: Obstacle[] = [];
  private bonus: FlyingBonus | null = null;
  private hud!: Hud;
  private joystick!: VirtualJoystick;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private resolving = false;
  private frozenUntil = 0;
  private bonusSpawned = false;
  private failProgress: number | null = null;
  private awaitingScriptedHit = false;

  constructor() {
    super(SceneKeys.Play);
  }

  create(): void {
    this.resolving = false;
    this.bonus = null;
    this.bonusSpawned = false;
    this.frozenUntil = 0;

    const session = loadSession(this);
    const config = getStage(session.stage);

    this.cameras.main.setBackgroundColor(COLORS.skyTop);
    addSkyGround(this);
    this.add.image(LAYOUT.yeshivaX, LAYOUT.yeshivaY, "yeshiva").setDepth(2);

    this.physics.world.setBounds(40, LAYOUT.playTop, STAGE_WIDTH - 80, LAYOUT.playBottom - LAYOUT.playTop);

    this.player = createPlayer(this, session.character);
    this.obstacles = spawnObstacles(this, config);
    this.hud = new Hud(this, session);
    this.joystick = new VirtualJoystick(this);

    const keyboard = this.input.keyboard;
    const stub = { isDown: false } as Phaser.Input.Keyboard.Key;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.wasd = keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      }) as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
    } else {
      this.cursors = {
        left: stub,
        right: stub,
        up: stub,
        down: stub,
        space: stub,
        shift: stub,
      };
      this.wasd = { W: stub, A: stub, S: stub, D: stub };
    }

    this.failProgress = rollFailProgress(config);
    this.awaitingScriptedHit = false;

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      stopBonusMusic();
    });
  }

  update(time: number, delta: number): void {
    if (this.resolving) {
      return;
    }

    const dt = delta / 1000;
    const session = loadSession(this);
    const config = getStage(session.stage);
    const frozen = time < this.frozenUntil;

    const moving =
      this.awaitingScriptedHit || this.player.returning
        ? false
        : steerPlayer(this, this.player, this.joystick, this.cursors, this.wasd);
    if (this.awaitingScriptedHit || this.player.returning) {
      this.player.sprite.setVelocity(0, 0);
    }
    updatePlayerVisuals(this.player, time, moving);
    updateObstacles(this.obstacles, dt, frozen, {
      x: this.player.sprite.x,
      y: this.player.sprite.y,
    });
    updateBonus(this.bonus, this.player, dt);

    if (this.player.returning) {
      this.updateEffectHud(time);
      return;
    }

    const progress = travelProgress(this.player.sprite.x);
    if (
      config.stageGoal === "FAIL_SUCCESSFULLY" &&
      this.failProgress !== null &&
      !this.awaitingScriptedHit &&
      progress >= this.failProgress
    ) {
      this.launchScriptedHit();
    }
    if (config.bonusType && !this.bonusSpawned && progress >= config.bonusSpawnProgress) {
      this.bonusSpawned = true;
      this.bonus = spawnBonus(this, config.bonusType, this.player);
    }

    if (
      this.bonus &&
      !this.bonus.collected &&
      playerHitsSprite(this.player, this.bonus.sprite, this.bonus.collectRadius)
    ) {
      this.applyBonus(this.bonus, time, config.bonusDurationMs);
    }

    this.updateEffectHud(time);

    for (const obstacle of this.obstacles) {
      if (!playerHitsObstacle(this.player, obstacle)) {
        continue;
      }
      if (this.awaitingScriptedHit || obstacle.homing) {
        this.finishFailSuccess(session, obstacle);
        break;
      }
      if (isBonusInvincible(this.player, time)) {
        kickObstacleOffscreen(this, obstacle, this.player.sprite.x, this.player.sprite.y);
        playBoom();
        continue;
      }
      if (isIframed(this.player, time)) {
        continue;
      }
      this.takeHit(session, obstacle);
      break;
    }

    if (config.stageGoal === "REACH_YESHIVA" && this.player.sprite.x <= LAYOUT.doorX) {
      this.finishYeshiva(session);
    }
  }

  private applyBonus(bonus: FlyingBonus, now: number, durationMs: number): void {
    collectBonus(this, bonus);
    playPickup();
    if (bonus.type === "INVINCIBILITY") {
      grantInvincibility(this.player, now, durationMs);
      startBonusMusic();
      this.time.delayedCall(durationMs, () => {
        stopBonusMusic();
      });
      showBanner(this, strings.pickupInvincible);
    } else {
      this.frozenUntil = now + durationMs;
      setObstaclesFrozen(this.obstacles, true);
      playFreeze();
      showBanner(this, strings.pickupFreeze);
      this.time.delayedCall(durationMs, () => {
        setObstaclesFrozen(this.obstacles, false);
        showBanner(this, strings.freezeOff, 900);
      });
    }
  }

  private updateEffectHud(now: number): void {
    const invLeft = Math.ceil((this.player.bonusInvincibleUntil - now) / 1000);
    const freezeLeft = Math.ceil((this.frozenUntil - now) / 1000);
    if (invLeft > 0) {
      this.hud.setEffect(strings.invincibleTimer(invLeft));
      return;
    }
    if (freezeLeft > 0) {
      this.hud.setEffect(strings.freezeTimer(freezeLeft));
      return;
    }
    this.hud.setEffect("");
  }

  private takeHit(session: ReturnType<typeof loadSession>, obstacle: Obstacle): void {
    session.lives -= 1;
    saveSession(this, session);
    this.hud.setLives(session.lives);
    flashObstacle(this, obstacle);
    playHit();
    showBanner(this, strings.hit, 900);
    this.cameras.main.shake(120, 0.004);
    this.player.sprite.setTint(0xd4483a);

    const dead = session.lives <= 0;
    flingPlayerToStart(this, this.player, () => {
      this.player.sprite.clearTint();
      if (dead) {
        this.resolving = true;
        this.player.sprite.setVelocity(0, 0);
        this.tweens.add({
          targets: this.player.sprite,
          angle: 90,
          y: this.player.sprite.y + 40,
          alpha: 0.2,
          duration: 420,
          onComplete: () => {
            this.scene.start(SceneKeys.GameOver);
          },
        });
        return;
      }
      grantIframes(this.player, this.time.now);
    });
  }

  private finishYeshiva(session: ReturnType<typeof loadSession>): void {
    this.resolving = true;
    this.player.sprite.setVelocity(0, 0);
    session.score += 1;
    saveSession(this, session);
    this.hud.setScore(session.score);
    this.tweens.add({
      targets: this.player.sprite,
      x: LAYOUT.yeshivaX + 20,
      alpha: 0.15,
      duration: TUNING.enterDoorMs,
      onComplete: () => {
        this.scene.start(SceneKeys.StageComplete);
      },
    });
  }

  private launchScriptedHit(): void {
    this.awaitingScriptedHit = true;
    this.player.sprite.setVelocity(0, 0);
    this.obstacles.push(spawnFinisher(this, this.player.sprite.x, this.player.sprite.y));
    this.cameras.main.flash(140, 255, 220, 180);
  }

  private finishFailSuccess(session: ReturnType<typeof loadSession>, obstacle: Obstacle): void {
    this.resolving = true;
    this.player.sprite.setVelocity(0, 0);
    flashObstacle(this, obstacle);
    playHit();
    this.cameras.main.shake(180, 0.008);
    this.player.sprite.setTint(0xd4483a);
    this.time.delayedCall(220, () => {
      this.player.sprite.clearTint();
      playFailSuccess();
      showBanner(this, strings.failSuccess, 1200);
    });
    session.score += 1;
    saveSession(this, session);
    this.hud.setScore(session.score);
    this.time.delayedCall(1500, () => {
      this.scene.start(SceneKeys.StageComplete, { failSuccess: true });
    });
  }
}
