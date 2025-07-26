import type { TCoor, TDirection, TRadius } from "./types";

export const screenWidth = 810;
export const screenHeight = 510;
export const cellSize = 30;
export const gridWidth = Math.floor(screenWidth / cellSize);
export const gridHeight = Math.floor(screenHeight / cellSize);

export const INVALID = -1;
export const HEAD = 0;

export const foods: Record<"basic" | "bonus", TRadius> = {
  basic: Math.floor(cellSize / 5),
  bonus: Math.floor(cellSize / 4),
};

export const DIRECTIONS = {
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  UP: [0, -1],
  DOWN: [0, 1],
} as const;

export const defaultSnakeBody: Array<TCoor> = [
  [6, 5],
  [5, 5],
  [6, 6],
];
export const defaultDir: TDirection = "RIGHT";

export const eventDelay = 50;
