import Phaser from "phaser";
import { COLORS, FONT_FAMILY, STAGE_HEIGHT, STAGE_WIDTH } from "../config";
import { strings } from "../content/strings.he";
import { addPillButton } from "./button";

export type GameLink = {
  title: string;
  url: string;
};

export const MORE_GAMES: readonly GameLink[] = [
  {
    title: "לוחם ישיבה",
    url: "https://bibihalemech.github.io/tora-figher/",
  },
  {
    title: "ניהול נכסים",
    url: "https://bibihalemech.github.io/assets/",
  },
  {
    title: "להעיר את ביבי",
    url: "https://bibihalemech.github.io/wakebibi1b/",
  },
];

type MoreGamesButtonOptions = {
  x?: number;
  y?: number;
  width?: number;
};

export function addMoreGamesButton(
  scene: Phaser.Scene,
  options: MoreGamesButtonOptions = {},
): Phaser.GameObjects.Container {
  const x = options.x ?? STAGE_WIDTH / 2;
  const y = options.y ?? STAGE_HEIGHT - 70;
  const width = options.width ?? 280;

  return addPillButton(scene, {
    label: strings.moreGames,
    x,
    y,
    width,
    onClick: () => openMoreGamesPanel(scene),
  });
}

function openMoreGamesPanel(scene: Phaser.Scene): void {
  const depth = 4000;
  const panelWidth = 720;
  const panelHeight = 520;
  const cx = STAGE_WIDTH / 2;
  const cy = STAGE_HEIGHT / 2;

  const root = scene.add.container(0, 0).setDepth(depth);

  const dim = scene.add
    .rectangle(cx, cy, STAGE_WIDTH, STAGE_HEIGHT, 0x000000, 0.55)
    .setInteractive();
  dim.on("pointerup", () => root.destroy());

  const panel = scene.add.graphics();
  panel.fillStyle(COLORS.paper, 1);
  panel.fillRoundedRect(
    cx - panelWidth / 2,
    cy - panelHeight / 2,
    panelWidth,
    panelHeight,
    28,
  );
  panel.lineStyle(4, COLORS.charcoal, 0.18);
  panel.strokeRoundedRect(
    cx - panelWidth / 2,
    cy - panelHeight / 2,
    panelWidth,
    panelHeight,
    28,
  );

  // Keep clicks on the panel from closing via the dim overlay.
  const panelHit = scene.add
    .rectangle(cx, cy, panelWidth, panelHeight, COLORS.paper, 0)
    .setInteractive();

  const title = scene.add
    .text(cx, cy - panelHeight / 2 + 70, strings.moreGames, {
      fontFamily: FONT_FAMILY,
      fontSize: "48px",
      fontStyle: "800",
      color: "#2C2A26",
      rtl: true,
    })
    .setOrigin(0.5);

  const items: Phaser.GameObjects.GameObject[] = [dim, panel, panelHit, title];

  MORE_GAMES.forEach((game, index) => {
    const y = cy - 80 + index * 100;
    const button = addPillButton(scene, {
      label: game.title,
      x: cx,
      y,
      width: 520,
      onClick: () => {
        window.open(game.url, "_blank", "noopener,noreferrer");
      },
    });
    button.setDepth(depth + 1);
    items.push(button);
  });

  const close = addPillButton(scene, {
    label: strings.close,
    x: cx,
    y: cy + panelHeight / 2 - 70,
    width: 220,
    onClick: () => root.destroy(),
  });
  close.setDepth(depth + 1);
  items.push(close);

  root.add(items);
}
