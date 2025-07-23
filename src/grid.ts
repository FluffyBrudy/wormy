import {
  cellSize,
  gridHeight,
  gridWidth,
  screenHeight,
  screenWidth,
} from "./constants";
import type { TGrid } from "./types";

export function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let row = 0; row <= gridHeight; row++) {
    ctx.moveTo(0, row * cellSize);
    ctx.lineTo(screenWidth, row * cellSize);
  }

  for (let col = 0; col <= gridWidth; col++) {
    ctx.moveTo(col * cellSize, 0);
    ctx.lineTo(col * cellSize, screenHeight);
  }

  ctx.stroke();
  ctx.closePath();
}

export function generateGrid(): TGrid {
  return new Array(gridHeight).fill(() => Array(gridWidth).fill(0));
}
