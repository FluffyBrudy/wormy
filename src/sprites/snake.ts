import { cellSize, DIRECTIONS, HEAD } from "../constants";
import type { TCoor, TDirection } from "../types";
import { isCoordinateEqual } from "../utils/math.utils";

type TSegment = "head" | "body" | "tail";

let waveTime = 0;

export function drawSnake(
  ctx: CanvasRenderingContext2D,
  snakePosition: Array<TCoor>,
  direction: TDirection
) {
  waveTime += 0.15;

  for (let i = snakePosition.length - 1; i >= 0; i--) {
    const [x, y] = snakePosition[i];
    let segmentType: TSegment = "body";
    if (i === 0) segmentType = "head";
    else if (i === snakePosition.length - 1) segmentType = "tail";

    const prevSegment =
      i < snakePosition.length - 1 ? snakePosition[i + 1] : null;
    const nextSegment = i > 0 ? snakePosition[i - 1] : null;

    if (segmentType === "body") {
      drawWaveBodySegment(ctx, x, y, prevSegment, nextSegment, i, waveTime);
    } else {
      drawSnakeSegment(
        ctx,
        x,
        y,
        segmentType,
        direction,
        prevSegment,
        nextSegment
      );
    }
  }
  drawSnakeEyes(ctx, snakePosition[HEAD], direction);
}

function drawWaveBodySegment(
  ctx: CanvasRenderingContext2D,
  gridX: number,
  gridY: number,
  prevSegment: TCoor | null,
  nextSegment: TCoor | null,
  index: number,
  time: number
) {
  const px = gridX * cellSize;
  const py = gridY * cellSize;
  const centerX = px + cellSize / 2;
  const centerY = py + cellSize / 2;
  const radius = cellSize * 0.45;

  const waveAmplitude = cellSize * 0.15;
  const waveLength = 6;

  const waveOffset = Math.sin(index / waveLength + time) * waveAmplitude;

  let dx = 0,
    dy = 0;
  if (prevSegment && nextSegment) {
    dx = nextSegment[0] - prevSegment[0];
    dy = nextSegment[1] - prevSegment[1];
  }

  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) {
    dx = 1;
    dy = 0;
  } else {
    dx /= length;
    dy /= length;
  }

  const perpX = -dy;
  const perpY = dx;

  const offsetX = centerX + perpX * waveOffset;
  const offsetY = centerY + perpY * waveOffset;

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const bodyGradient = ctx.createRadialGradient(
    offsetX,
    offsetY,
    radius * 0.1,
    offsetX,
    offsetY,
    radius * 1.4
  );
  bodyGradient.addColorStop(0, "#76c893");
  bodyGradient.addColorStop(0.3, "#43a047");
  bodyGradient.addColorStop(0.7, "#2e7d32");
  bodyGradient.addColorStop(1, "#1b4d20");

  ctx.fillStyle = bodyGradient;

  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 1.5;
  ctx.shadowOffsetY = 1.5;

  ctx.beginPath();

  ctx.ellipse(offsetX, offsetY, radius, radius, 0, 0, Math.PI * 2);

  ctx.fill();

  ctx.restore();
}

export function updateSnake(
  snakePosition: Array<TCoor>,
  direction: TDirection
) {
  const [dx, dy] = DIRECTIONS[direction];
  const [headX, headY] = snakePosition[0];
  const newHead: TCoor = [headX + dx, headY + dy];
  snakePosition.unshift(newHead);
  snakePosition.pop();
}

export function growSnake(snakePositions: TCoor[]) {
  const tail = snakePositions[snakePositions.length - 1];
  const beforeTail = snakePositions[snakePositions.length - 2];
  const dx = tail[0] - beforeTail[0];
  const dy = tail[1] - beforeTail[1];
  snakePositions.push([tail[0] + dx, tail[1] + dy]);
}

function drawSnakeSegment(
  ctx: CanvasRenderingContext2D,
  gridX: number,
  gridY: number,
  segmentType: TSegment,
  direction: TDirection,
  prevSegment: TCoor | null,
  nextSegment: TCoor | null
) {
  const px = gridX * cellSize;
  const py = gridY * cellSize;
  const centerX = px + cellSize / 2;
  const centerY = py + cellSize / 2;
  const radius = cellSize * 0.45;

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (segmentType === "head") {
    drawSnakeHead(ctx, centerX, centerY, radius, direction);
  } else if (segmentType === "tail") {
    drawSnakeTail(ctx, centerX, centerY, radius, prevSegment, [gridX, gridY]);
  } else {
    drawSnakeBody(ctx, centerX, centerY, radius, prevSegment, nextSegment, [
      gridX,
      gridY,
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
  const elongationRatio = 0.25;

  const headGradient = ctx.createRadialGradient(
    centerX,
    centerY,
    radius * 0.1,
    centerX,
    centerY,
    radius * 1.5
  );
  headGradient.addColorStop(0, "#ff7f9f");
  headGradient.addColorStop(0.3, "#ff526a");
  headGradient.addColorStop(0.75, "#c2181b");
  headGradient.addColorStop(1, "#7b0a0d");

  ctx.fillStyle = headGradient;

  let radiusX = radius * 1.0;
  let radiusY = radius * 1.0;

  if (direction === "LEFT" || direction === "RIGHT") {
    radiusX = radius * (1 + elongationRatio);
  } else {
    radiusY = radius * (1 + elongationRatio);
  }

  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  const highlightGradient = ctx.createRadialGradient(
    centerX - radiusX * 0.5,
    centerY - radiusY * 0.5,
    0,
    centerX - radiusX * 0.15,
    centerY - radiusY * 0.15,
    radius * 0.7
  );
  highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
  highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = highlightGradient;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY,
    radiusX * 0.9,
    radiusY * 0.9,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.shadowColor = "transparent";

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY,
    radiusX * 0.8,
    radiusY * 0.8,
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
  currentPosition: TCoor
) {
  const bodyGradient = ctx.createRadialGradient(
    centerX,
    centerY,
    radius * 0.1,
    centerX,
    centerY,
    radius * 1.4
  );
  bodyGradient.addColorStop(0, "#76c893");
  bodyGradient.addColorStop(0.3, "#43a047");
  bodyGradient.addColorStop(0.7, "#2e7d32");
  bodyGradient.addColorStop(1, "#1b4d20");

  ctx.fillStyle = bodyGradient;

  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 1.5;
  ctx.shadowOffsetY = 1.5;

  if (prevSegment && nextSegment) {
    const [px, py] = prevSegment;
    const [nx, ny] = nextSegment;

    const isCorner = px !== nx && py !== ny;

    ctx.beginPath();

    if (isCorner) {
      drawBodyCorner(
        ctx,
        centerX,
        centerY,
        radius,
        prevSegment,
        nextSegment,
        currentPosition
      );
    } else {
      ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
    }
  } else {
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
  }

  ctx.fill();

  ctx.shadowColor = "transparent";

  const glossGradient = ctx.createRadialGradient(
    centerX - radius * 0.3,
    centerY - radius * 0.3,
    0,
    centerX - radius * 0.1,
    centerY - radius * 0.1,
    radius * 0.8
  );
  glossGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
  glossGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = glossGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radius * 0.9, radius * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  drawScalePattern(ctx, centerX, centerY, radius);
}

function drawBodyCorner(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  prevSegment: TCoor,
  nextSegment: TCoor,
  currentPos: TCoor
) {
  const [px, py] = prevSegment;
  const [nx, ny] = nextSegment;
  const [cx, cy] = currentPos;

  const fromPrev = [px - cx, py - cy];
  const toNext = [nx - cx, ny - cy];

  const norm = (v: number) => (v === 0 ? 0 : v / Math.abs(v));
  const prevX = norm(fromPrev[0]);
  const prevY = norm(fromPrev[1]);
  const nextX = norm(toNext[0]);
  const nextY = norm(toNext[1]);

  ctx.beginPath();

  const cornerRadius = radius * 1.1;
  const cpOffset = radius * 0.45;

  const getPoint = (offsetX: number, offsetY: number): [number, number] => [
    centerX + offsetX * radius,
    centerY + offsetY * radius,
  ];

  if ((prevX === -1 && nextY === -1) || (prevY === -1 && nextX === -1)) {
    const start = getPoint(-1, 0);

    const end = getPoint(0, -1);

    const cp1 = [start[0], start[1] - cpOffset];
    const cp2 = [end[0] - cpOffset, end[1]];
    const arcCenter = getPoint(-1, -1);

    ctx.moveTo(start[0], start[1]);
    ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], end[0], end[1]);
    ctx.arc(arcCenter[0], arcCenter[1], cornerRadius, 0, 0.5 * Math.PI, false);
  } else if ((prevX === -1 && nextY === 1) || (prevY === 1 && nextX === -1)) {
    const start = getPoint(-1, 0);
    const end = getPoint(0, 1);
    const cp1 = [start[0], start[1] + cpOffset];
    const cp2 = [end[0] - cpOffset, end[1]];
    const arcCenter = getPoint(-1, 1);

    ctx.moveTo(start[0], start[1]);
    ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], end[0], end[1]);
    ctx.arc(
      arcCenter[0],
      arcCenter[1],
      cornerRadius,
      1.5 * Math.PI,
      Math.PI,
      true
    );
  } else if ((prevX === 1 && nextY === -1) || (prevY === -1 && nextX === 1)) {
    const start = getPoint(1, 0);
    const end = getPoint(0, -1);
    const cp1 = [start[0], start[1] - cpOffset];
    const cp2 = [end[0] + cpOffset, end[1]];
    const arcCenter = getPoint(1, -1);

    ctx.moveTo(start[0], start[1]);
    ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], end[0], end[1]);
    ctx.arc(arcCenter[0], arcCenter[1], cornerRadius, 0.5 * Math.PI, 0, true);
  } else if ((prevX === 1 && nextY === 1) || (prevY === 1 && nextX === 1)) {
    const start = getPoint(1, 0);
    const end = getPoint(0, 1);
    const cp1 = [start[0], start[1] + cpOffset];
    const cp2 = [end[0] + cpOffset, end[1]];
    const arcCenter = getPoint(1, 1);

    ctx.moveTo(start[0], start[1]);
    ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], end[0], end[1]);
    ctx.arc(
      arcCenter[0],
      arcCenter[1],
      cornerRadius,
      1.5 * Math.PI,
      2 * Math.PI,
      false
    );
  } else {
    ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
  }

  ctx.closePath();
  ctx.fill();
}
function drawSnakeTail(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  prevSegment: TCoor | null,
  currentPos: TCoor
) {
  const tailGradient = ctx.createRadialGradient(
    centerX,
    centerY,
    radius * 0.1,
    centerX,
    centerY,
    radius
  );
  tailGradient.addColorStop(0, "#a0d6b4");
  tailGradient.addColorStop(0.5, "#68b36b");
  tailGradient.addColorStop(1, "#3a9444");

  ctx.fillStyle = tailGradient;

  ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  if (prevSegment) {
    const [prevX, prevY] = prevSegment;
    const [curX, curY] = currentPos;
    const dx = curX - prevX;
    const dy = curY - prevY;

    ctx.beginPath();

    if (dx !== 0) {
      ctx.ellipse(
        centerX - dx * radius * 0.25,
        centerY,
        radius * 0.8,
        radius * 1.0,
        0,
        0,
        Math.PI * 2
      );
    } else {
      ctx.ellipse(
        centerX,
        centerY - dy * radius * 0.25,
        radius * 1.0,
        radius * 0.8,
        0,
        0,
        Math.PI * 2
      );
    }
  } else {
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      radius * 0.7,
      radius * 0.7,
      0,
      0,
      Math.PI * 2
    );
  }
  ctx.fill();

  ctx.shadowColor = "transparent";

  const highlight = ctx.createRadialGradient(
    centerX,
    centerY,
    radius * 0.1,
    centerX,
    centerY,
    radius * 0.7
  );
  highlight.addColorStop(0, "rgba(255, 255, 255, 0.3)");
  highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY,
    radius * 0.65,
    radius * 0.65,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawScalePattern(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 0.4;

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const r = radius * (0.3 + i * 0.18);
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSnakeEyes(
  ctx: CanvasRenderingContext2D,
  head: TCoor,
  direction: TDirection
) {
  const [headX, headY] = head;
  const centerX = headX * cellSize + cellSize / 2;
  const centerY = headY * cellSize + cellSize / 2;
  const eyeRadiusWhite = cellSize * 0.1;
  const pupilRadius = cellSize * 0.05;
  const eyeOffset = cellSize * 0.22;

  let eye1X = centerX,
    eye1Y = centerY,
    eye2X = centerX,
    eye2Y = centerY;

  switch (direction) {
    case "LEFT":
      eye1X = centerX - eyeOffset;
      eye1Y = centerY - eyeOffset * 0.6;
      eye2X = centerX - eyeOffset;
      eye2Y = centerY + eyeOffset * 0.6;
      break;
    case "RIGHT":
      eye1X = centerX + eyeOffset;
      eye1Y = centerY - eyeOffset * 0.6;
      eye2X = centerX + eyeOffset;
      eye2Y = centerY + eyeOffset * 0.6;
      break;
    case "UP":
      eye1X = centerX - eyeOffset * 0.6;
      eye1Y = centerY - eyeOffset;
      eye2X = centerX + eyeOffset * 0.6;
      eye2Y = centerY - eyeOffset;
      break;
    case "DOWN":
      eye1X = centerX - eyeOffset * 0.6;
      eye1Y = centerY + eyeOffset;
      eye2X = centerX + eyeOffset * 0.6;
      eye2Y = centerY + eyeOffset;
      break;
  }

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 3;
  ctx.fillStyle = "#fff";

  ctx.beginPath();
  ctx.ellipse(
    eye1X,
    eye1Y,
    eyeRadiusWhite,
    eyeRadiusWhite * 1.2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    eye2X,
    eye2Y,
    eyeRadiusWhite,
    eyeRadiusWhite * 1.2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(eye1X, eye1Y, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(eye2X, eye2Y, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.arc(
    eye1X - pupilRadius * 0.4,
    eye1Y - pupilRadius * 0.4,
    pupilRadius * 0.5,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    eye2X - pupilRadius * 0.4,
    eye2Y - pupilRadius * 0.4,
    pupilRadius * 0.5,
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
