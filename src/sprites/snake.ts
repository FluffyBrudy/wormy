import { cellSize, DIRECTIONS, HEAD } from "../constants";
import type { TCoor, TDirection } from "../types";
import { isCoordinateEqual } from "../utils/math.utils";

type TSegment = "head" | "body" | "tail";

export function drawSnake(
  ctx: CanvasRenderingContext2D,
  snakePosition: Array<TCoor>,
  direction: TDirection
) {
  for (let i = snakePosition.length - 1; i >= 0; i--) {
    const [x, y] = snakePosition[i];
    let segmentType: TSegment = "body";

    if (i === 0) segmentType = "head";
    else if (i === snakePosition.length - 1) segmentType = "tail";

    const prevSegment =
      i < snakePosition.length - 1 ? snakePosition[i + 1] : null;
    const nextSegment = i > 0 ? snakePosition[i - 1] : null;

    drawSnakeSegment(
      x,
      y,
      ctx,
      segmentType,
      prevSegment,
      nextSegment,
      direction
    );
  }

  drawSnakeEyes(snakePosition[HEAD], direction, ctx);
}

export function updateSnake(
  snakePosition: Array<TCoor>,
  direction: TDirection
) {
  const [dirX, dirY] = DIRECTIONS[direction];
  const [headX, headY] = snakePosition[0];
  const [newHeadX, newHeadY] = [headX + dirX, headY + dirY];
  snakePosition.unshift([newHeadX, newHeadY]);
  snakePosition.pop();
}

export function growSnake(snakePositions: Array<TCoor>) {
  const tail = snakePositions[snakePositions.length - 1];
  const secondToLastTail = snakePositions[snakePositions.length - 2];

  const tailDx = tail[0] - secondToLastTail[0];
  const tailDy = tail[1] - secondToLastTail[1];

  const newTail: TCoor = [tail[0] + tailDx, tail[1] + tailDy];

  snakePositions.push(newTail);
}

function drawSnakeSegment(
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  segmentType: TSegment = "body",
  prevSegment: TCoor | null = null,
  nextSegment: TCoor | null = null,
  direction: TDirection = "LEFT"
) {
  const px = x * cellSize;
  const py = y * cellSize;
  const centerX = px + cellSize / 2;
  const centerY = py + cellSize / 2;
  const radius = cellSize * 0.45;

  ctx.save();

  if (segmentType === "head") {
    drawSnakeHead(ctx, centerX, centerY, radius, direction);
  } else if (segmentType === "tail") {
    drawSnakeTail(ctx, centerX, centerY, radius, prevSegment, [x, y]);
  } else {
    drawSnakeBody(ctx, centerX, centerY, radius, prevSegment, nextSegment, [
      x,
      y,
    ]);
  }

  ctx.restore();
}

function drawSnakeHead(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  direction: TDirection
) {
  const gradient = ctx.createRadialGradient(
    centerX - radius * 0.3,
    centerY - radius * 0.3,
    0,
    centerX,
    centerY,
    radius
  );
  gradient.addColorStop(0, "#ff6b6b");
  gradient.addColorStop(0.3, "#ff5252");
  gradient.addColorStop(0.7, "#e53935");
  gradient.addColorStop(1, "#c62828");

  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();

  const elongation = 0.1;
  let scaleX = 1,
    scaleY = 1;

  switch (direction) {
    case "LEFT":
    case "RIGHT":
      scaleX = 1 + elongation;
      break;
    case "UP":
    case "DOWN":
      scaleY = 1 + elongation;
      break;
  }

  ctx.ellipse(
    centerX,
    centerY,
    radius * scaleX,
    radius * scaleY,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.shadowColor = "transparent";
  const highlightGradient = ctx.createRadialGradient(
    centerX - radius * 0.4,
    centerY - radius * 0.4,
    0,
    centerX - radius * 0.2,
    centerY - radius * 0.2,
    radius * 0.6
  );
  highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY,
    radius * scaleX,
    radius * scaleY,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = highlightGradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY,
    radius * 0.8 * scaleX,
    radius * 0.8 * scaleY,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();
}

function drawSnakeBody(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  prevSegment: TCoor | null,
  nextSegment: TCoor | null,
  currentPos: TCoor
) {
  const gradient = ctx.createRadialGradient(
    centerX - radius * 0.3,
    centerY - radius * 0.3,
    0,
    centerX,
    centerY,
    radius
  );
  gradient.addColorStop(0, "#66bb6a");
  gradient.addColorStop(0.3, "#4caf50");
  gradient.addColorStop(0.7, "#388e3c");
  gradient.addColorStop(1, "#2e7d32");

  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  ctx.beginPath();

  if (prevSegment && nextSegment) {
    const [px, py] = prevSegment;
    const [nx, ny] = nextSegment;

    const isCorner = px !== nx && py !== ny;

    if (isCorner) {
      drawCornerSegment(
        ctx,
        centerX,
        centerY,
        radius,
        prevSegment,
        nextSegment,
        currentPos
      );
    } else {
      ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
    }
  } else {
    ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
  }

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.shadowColor = "transparent";
  const highlightGradient = ctx.createRadialGradient(
    centerX - radius * 0.4,
    centerY - radius * 0.4,
    0,
    centerX - radius * 0.2,
    centerY - radius * 0.2,
    radius * 0.6
  );
  highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
  highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radius * 0.9, radius * 0.9, 0, 0, Math.PI * 2);
  ctx.fillStyle = highlightGradient;
  ctx.fill();

  drawScalePattern(ctx, centerX, centerY, radius);
}

function drawCornerSegment(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  prevSegment: TCoor,
  nextSegment: TCoor,
  currentPos: TCoor
) {
  const px = prevSegment[0];
  const ny = nextSegment[0];
  const [cx, cy] = currentPos;

  const padding = radius * 0.2;

  const startX = centerX - radius + padding;
  const startY = centerY - radius + padding;
  const width = radius * 2 - padding * 2;
  const height = radius * 2 - padding * 2;

  if (px < cx && ny < cy) {
    ctx.roundRect(startX, startY, width, height, radius * 0.3);
  } else if (px > cx && ny < cy) {
    ctx.roundRect(startX, startY, width, height, radius * 0.3);
  } else if (px < cx && ny > cy) {
    ctx.roundRect(startX, startY, width, height, radius * 0.3);
  } else {
    ctx.roundRect(startX, startY, width, height, radius * 0.3);
  }
}

function drawSnakeTail(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  prevSegment: TCoor | null,
  currentPos: TCoor
) {
  const gradient = ctx.createRadialGradient(
    centerX - radius * 0.3,
    centerY - radius * 0.3,
    0,
    centerX,
    centerY,
    radius
  );
  gradient.addColorStop(0, "#81c784");
  gradient.addColorStop(0.5, "#66bb6a");
  gradient.addColorStop(1, "#4caf50");

  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  if (prevSegment) {
    const [px, py] = prevSegment;
    const [cx, cy] = currentPos;

    const dx = cx - px;
    const dy = cy - py;

    ctx.beginPath();

    if (dx !== 0) {
      ctx.ellipse(
        centerX - dx * radius * 0.2,
        centerY,
        radius * 0.8,
        radius,
        0,
        0,
        Math.PI * 2
      );
    } else {
      ctx.ellipse(
        centerX,
        centerY - dy * radius * 0.2,
        radius,
        radius * 0.8,
        0,
        0,
        Math.PI * 2
      );
    }
  } else {
    ctx.ellipse(
      centerX,
      centerY,
      radius * 0.8,
      radius * 0.8,
      0,
      0,
      Math.PI * 2
    );
  }

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.shadowColor = "transparent";
  const highlightGradient = ctx.createRadialGradient(
    centerX - radius * 0.3,
    centerY - radius * 0.3,
    0,
    centerX,
    centerY,
    radius * 0.6
  );
  highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radius * 0.6, radius * 0.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = highlightGradient;
  ctx.fill();
}

function drawScalePattern(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 0.5;

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const r = radius * (0.3 + i * 0.2);
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSnakeEyes(
  head: TCoor,
  direction: TDirection,
  ctx: CanvasRenderingContext2D
) {
  const [headX, headY] = head;
  const centerX = headX * cellSize + cellSize / 2;
  const centerY = headY * cellSize + cellSize / 2;
  const eyeSize = cellSize * 0.08;
  const eyeDistance = cellSize * 0.25;

  let eye1X, eye1Y, eye2X, eye2Y;

  switch (direction) {
    case "LEFT":
      eye1X = centerX - eyeDistance;
      eye1Y = centerY - eyeDistance;
      eye2X = centerX - eyeDistance;
      eye2Y = centerY + eyeDistance;
      break;
    case "RIGHT":
      eye1X = centerX + eyeDistance;
      eye1Y = centerY - eyeDistance;
      eye2X = centerX + eyeDistance;
      eye2Y = centerY + eyeDistance;
      break;
    case "UP":
      eye1X = centerX - eyeDistance;
      eye1Y = centerY - eyeDistance;
      eye2X = centerX + eyeDistance;
      eye2Y = centerY - eyeDistance;
      break;
    case "DOWN":
      eye1X = centerX - eyeDistance;
      eye1Y = centerY + eyeDistance;
      eye2X = centerX + eyeDistance;
      eye2Y = centerY + eyeDistance;
      break;
  }

  ctx.save();
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 8;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 4;
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(eye1X, eye1Y, eyeSize * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eye2X, eye2Y, eyeSize * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(
    eye1X - eyeSize * 0.2,
    eye1Y - eyeSize * 0.2,
    eyeSize * 0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    eye2X - eyeSize * 0.2,
    eye2Y - eyeSize * 0.2,
    eyeSize * 0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

export function hasCollidedWithSelf(positions: Array<TCoor>) {
  return positions
    .slice(1)
    .some((coor) => isCoordinateEqual(positions[HEAD], coor));
}
