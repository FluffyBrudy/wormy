import { screenWidth, screenHeight, cellSize } from "../constants";

const fogLayers = 3;

const fogColors = [
  "rgba(255, 255, 255, 0.012)",
  "rgba(200, 200, 255, 0.01)",
  "rgba(180, 180, 255, 0.008)",
];

let time = 0;

export function drawFoggyBackground(ctx: CanvasRenderingContext2D) {
  time += 0.5;

  ctx.fillStyle = "#0b0b0f";
  ctx.fillRect(0, 0, screenWidth, screenHeight);

  drawGrid(ctx);

  for (let layer = 0; layer < fogLayers; layer++) {
    drawFogLayer(ctx, layer, time);
  }
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
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
}

function drawFogLayer(
  ctx: CanvasRenderingContext2D,
  layerIndex: number,
  t: number
) {
  const speed = 0.0006 + layerIndex * 0.0004;
  const waveHeight = 12 + layerIndex * 10;
  const spacing = 14;
  const color = fogColors[layerIndex];

  ctx.fillStyle = color;

  for (let y = 0; y < screenHeight + spacing; y += spacing) {
    ctx.beginPath();
    for (let x = 0; x <= screenWidth; x += 10) {
      const offset = Math.sin(x * 0.01 + t * speed + layerIndex) * waveHeight;
      const baseY = y + offset;
      if (x === 0) {
        ctx.moveTo(x, baseY);
      } else {
        ctx.lineTo(x, baseY);
      }
    }
    ctx.lineTo(screenWidth, screenHeight);
    ctx.lineTo(0, screenHeight);
    ctx.closePath();
    ctx.fill();
  }
}
