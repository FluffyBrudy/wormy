import { cellSize, DIRECTIONS, HEAD } from "./constants";
import type { TCoor, TDirection } from "./types";
import { isCoordinateEqual } from "./utils/math.utils";

type TSegment = "head" | "body" | "tail";

export function drawSnake(
  ctx: CanvasRenderingContext2D,
  snakePosition: Array<TCoor>,
  direction: TDirection
) {
  const [headX, headY] = snakePosition[HEAD];
  drawSnakeSegment(headX, headY, ctx, "head");
  drawSnakeEye(snakePosition[HEAD], direction, ctx);
  snakePosition.slice(1, snakePosition.length - 1).forEach(([x, y]) => {
    drawSnakeSegment(x, y, ctx, "body");
  });
  const [tailX, tailY] = snakePosition[snakePosition.length - 1];
  drawSnakeSegment(tailX, tailY, ctx, "tail");
}

export function updateSnake(
  snakePosition: Array<TCoor>,
  direction: TDirection
) {
  const [dirX, dirY] = DIRECTIONS[direction];
  let [headX, headY] = snakePosition[0];
  let [newHeadX, newHeadY] = [headX + dirX, headY + dirY];
  snakePosition.unshift([newHeadX, newHeadY]);
  snakePosition.pop();
}

export function growSnake(
  snakePositions: Array<TCoor>,
  snakeDirection: TDirection
) {
  const head = snakePositions[HEAD];
  const [dx, dy] = DIRECTIONS[snakeDirection];
  const newHead: TCoor = [head[0] + dx, head[1] + dy];
  snakePositions.unshift(newHead);
}

export const eyeOffset: Record<
  TDirection,
  { first: [number, number]; second: [number, number] }
> = {
  LEFT: {
    first: [cellSize * 0.2, cellSize * 0.2],
    second: [cellSize * 0.2, cellSize * 0.7],
  },
  RIGHT: {
    first: [cellSize * 0.7, cellSize * 0.2],
    second: [cellSize * 0.7, cellSize * 0.7],
  },
  UP: {
    first: [cellSize * 0.2, cellSize * 0.2],
    second: [cellSize * 0.7, cellSize * 0.2],
  },
  DOWN: {
    first: [cellSize * 0.2, cellSize * 0.7],
    second: [cellSize * 0.7, cellSize * 0.7],
  },
};

function drawSnakeSegment(
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  segmentType: TSegment = "body"
) {
  const color = segmentType === "head" ? "red" : "lime";
  const strokeColor = "green";

  const px = x * cellSize;
  const py = y * cellSize;

  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.roundRect(px, py, cellSize, cellSize, 5);
  ctx.strokeStyle = strokeColor;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function drawSnakeEye(
  head: TCoor,
  direction: TDirection,
  ctx: CanvasRenderingContext2D
) {
  const [headX, headY] = head;
  const offset = eyeOffset[direction];
  const eyeFirst = [
    headX * cellSize + offset.first[0],
    headY * cellSize + offset.first[1],
  ] as TCoor;
  const eyeSecond = [
    headX * cellSize + offset.second[0],
    headY * cellSize + offset.second[1],
  ] as TCoor;

  const size = cellSize / 10;
  ctx.rect(...eyeFirst, ...[size, size]);
  ctx.rect(...eyeSecond, ...[size, size]);
  ctx.fillStyle = "brown";
  ctx.strokeStyle = "red";
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

export function hasCollidedWithSelf(positions: Array<TCoor>) {
  return positions
    .slice(1)
    .some((coor) => isCoordinateEqual(positions[HEAD], coor));
}
