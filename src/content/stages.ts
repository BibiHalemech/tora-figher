export type MovementPattern =
  | "VERTICAL"
  | "HORIZONTAL"
  | "DIAGONAL"
  | "SINE_WAVE"
  | "CIRCLE"
  | "FIGURE_8"
  | "PATROL";

export type BonusType = "INVINCIBILITY" | "FREEZE";

export type StageGoal = "REACH_YESHIVA" | "FAIL_SUCCESSFULLY";

export type StageNumber = 1 | 2 | 3 | 4;

export type StageConfig = {
  stageNumber: StageNumber;
  obstacleCount: readonly [number, number];
  speedRange: readonly [number, number];
  movementPatterns: readonly MovementPattern[];
  bonusType?: BonusType;
  bonusSpawnProgress: number;
  bonusDurationMs: number;
  stageGoal: StageGoal;
  failProgressRange?: readonly [number, number];
};

export const STAGES: Record<StageNumber, StageConfig> = {
  1: {
    stageNumber: 1,
    obstacleCount: [2, 3],
    speedRange: [80, 120],
    movementPatterns: ["VERTICAL"],
    bonusSpawnProgress: 0.5,
    bonusDurationMs: 6000,
    stageGoal: "REACH_YESHIVA",
  },
  2: {
    stageNumber: 2,
    obstacleCount: [4, 5],
    speedRange: [140, 200],
    movementPatterns: ["DIAGONAL", "SINE_WAVE", "VERTICAL"],
    bonusType: "INVINCIBILITY",
    bonusSpawnProgress: 0.5,
    bonusDurationMs: 25000,
    stageGoal: "REACH_YESHIVA",
  },
  3: {
    stageNumber: 3,
    obstacleCount: [5, 7],
    speedRange: [200, 280],
    movementPatterns: ["SINE_WAVE", "CIRCLE", "FIGURE_8", "PATROL", "DIAGONAL"],
    bonusType: "FREEZE",
    bonusSpawnProgress: 0.5,
    bonusDurationMs: 6000,
    stageGoal: "REACH_YESHIVA",
  },
  4: {
    stageNumber: 4,
    obstacleCount: [5, 7],
    speedRange: [220, 320],
    movementPatterns: ["FIGURE_8", "CIRCLE", "DIAGONAL", "SINE_WAVE", "PATROL"],
    bonusSpawnProgress: 0.5,
    bonusDurationMs: 6000,
    stageGoal: "FAIL_SUCCESSFULLY",
    failProgressRange: [0.55, 0.85],
  },
};

export function getStage(stage: StageNumber): StageConfig {
  return STAGES[stage];
}
