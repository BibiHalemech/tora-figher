export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

export const COLORS = {
  skyTop: 0x7ed0ff,
  skyBottom: 0xc8eeff,
  ground: 0xe8c98a,
  groundDark: 0xc9a65e,
  paper: 0xfff8ee,
  charcoal: 0x2c2a26,
  slate: 0x5e6a73,
  gold: 0xf4c542,
  crimson: 0xd4483a,
  ice: 0x7fd7ff,
  halo: 0xffe066,
  olive: 0x6b7a3a,
} as const;

export const LAYOUT = {
  playTop: 150,
  playBottom: 1000,
  yeshivaX: 210,
  yeshivaY: 620,
  doorX: 320,
  playerStartX: 1740,
  playerStartY: 560,
  obstacleMinX: 480,
  obstacleMaxX: 1380,
  hudY: 56,
  bannerY: 200,
  joystickX: 960,
  joystickY: 980,
} as const;

export const TUNING = {
  playerSpeed: 320,
  hitIframesMs: 1250,
  hitReturnMs: 780,
  bonusDurationMs: 25000,
  bonusFlySpeed: 220,
  bonusPortraitHeight: 176,
  obstaclePortraitHeight: 148,
  failProgressMin: 0.55,
  failProgressMax: 0.85,
  startingLives: 3,
  introMs: 1700,
  enterDoorMs: 520,
  guaranteedGap: 210,
  collisionRadius: 32,
} as const;

export const FONT_FAMILY = "Heebo, Assistant, Arial, sans-serif";

export const SceneKeys = {
  Boot: "Boot",
  Title: "Title",
  CharacterSelect: "CharacterSelect",
  StageIntro: "StageIntro",
  Play: "Play",
  StageComplete: "StageComplete",
  GameOver: "GameOver",
  Victory: "Victory",
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];

export type CharacterId = "torah" | "tefillin" | "yeshiva";

export const CHARACTERS: readonly CharacterId[] = ["torah", "tefillin", "yeshiva"];

export const CHARACTER_TEXTURE: Record<CharacterId, string> = {
  torah: "player_torah",
  tefillin: "player_tefillin",
  yeshiva: "player_yeshiva",
};

export const OBSTACLE_KINDS = [
  "helmet",
  "tank",
  "drone",
  "bullet",
  "blob",
  "medal",
] as const;

export type ObstacleKind = (typeof OBSTACLE_KINDS)[number];
