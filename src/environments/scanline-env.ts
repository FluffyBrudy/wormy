import { cellSize, screenHeight, screenWidth } from "../constants";
import { environmentColors } from "./style-config";

export function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = environmentColors.gridBackground;
  ctx.fillRect(0, 0, screenWidth, screenHeight);

  ctx.strokeStyle = environmentColors.gridLine;
  ctx.lineWidth = 1;

  for (let x = 0; x <= screenWidth; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, screenHeight);
    ctx.stroke();
  }

  for (let y = 0; y <= screenHeight; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(screenWidth, y);
    ctx.stroke();
  }

  drawScanlines(ctx);
}

function drawScanlines(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = environmentColors.scanline;
  for (let y = 0; y < screenHeight; y += 4) {
    ctx.fillRect(0, y, screenWidth, 1);
  }
}
