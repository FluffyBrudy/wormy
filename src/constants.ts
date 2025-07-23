import type { TCoor, TRadius } from "./types";

export const screenWidth = 800;
export const screenHeight = 520;
export const cellSize = 40;
export const gridWidth = Math.floor(screenWidth / cellSize);
export const gridHeight = Math.floor(screenHeight / cellSize);

export const INVALID = -1;
export const HEAD = 0;

export const foods: Record<"basic" | "bonus", TRadius> = {
  basic: Math.floor(cellSize / 4),
  bonus: Math.floor(cellSize / 2),
};

export const DIRECTIONS = {
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  UP: [0, -1],
  DOWN: [0, 1],
} as const;
