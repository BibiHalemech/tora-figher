import Phaser from "phaser";
import { COLORS, STAGE_HEIGHT, STAGE_WIDTH } from "./config";
import { BootScene } from "./scenes/BootScene";
import { CharacterSelectScene } from "./scenes/CharacterSelectScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { PlayScene } from "./scenes/PlayScene";
import { StageCompleteScene } from "./scenes/StageCompleteScene";
import { StageIntroScene } from "./scenes/StageIntroScene";
import { TitleScene } from "./scenes/TitleScene";
import { VictoryScene } from "./scenes/VictoryScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: STAGE_WIDTH,
  height: STAGE_HEIGHT,
  backgroundColor: COLORS.skyTop,
  banner: false,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  scene: [
    BootScene,
    TitleScene,
    CharacterSelectScene,
    StageIntroScene,
    PlayScene,
    StageCompleteScene,
    GameOverScene,
    VictoryScene,
  ],
};

const game = new Phaser.Game(config);

declare global {
  interface Window {
    game: Phaser.Game;
  }
}

window.game = game;
