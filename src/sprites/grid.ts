import {
  cellSize,
  gridHeight,
  gridWidth,
  screenHeight,
  screenWidth,
} from "../constants";
import type { TCoor } from "../types";

export function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.save();

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const x = col * cellSize;
      const y = row * cellSize;

      const isEven = (row + col) % 2 === 0;
      ctx.fillStyle = isEven
        ? "rgba(255, 255, 255, 0.02)"
        : "rgba(255, 255, 255, 0.01)";

      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  const lineGradient = ctx.createLinearGradient(
    0,
    0,
    screenWidth,
    screenHeight
  );
  lineGradient.addColorStop(0, "rgba(0, 255, 127, 0.1)");
  lineGradient.addColorStop(0.5, "rgba(0, 255, 127, 0.05)");
  lineGradient.addColorStop(1, "rgba(0, 255, 127, 0.1)");

  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 0.5;
  ctx.beginPath();

  for (let col = 0; col <= gridWidth; col++) {
    const x = col * cellSize;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, screenHeight);
  }

  for (let row = 0; row <= gridHeight; row++) {
    const y = row * cellSize;
    ctx.moveTo(0, y);
    ctx.lineTo(screenWidth, y);
  }

  ctx.stroke();
  ctx.restore();
}

export function hasCollidedWithWalls(head: TCoor) {
  const [headX, headY] = head;
  return headX < 0 || headX >= gridWidth || headY < 0 || headY >= gridHeight;
}
