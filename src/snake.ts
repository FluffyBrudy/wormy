import { cellSize, DIRECTIONS, HEAD } from "./constants";
import type { TCoor, TDirection } from "./types";

export function drawSnake(
  ctx: CanvasRenderingContext2D,
  snakePosition: Array<TCoor>,
  direction: TDirection
) {
  snakePosition.forEach(([x, y], i) => {
    const px = x * cellSize;
    const py = y * cellSize;
    ctx.beginPath();
    ctx.fillStyle = "lime";
    ctx.roundRect(px, py, cellSize, cellSize, 5);
    ctx.strokeStyle = "green";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    if (i === 0) {
      drawSnakeEye(snakePosition[HEAD], direction, ctx);
    }
  });
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

export const eyeOffset: Record<
  TDirection,
  { first: [number, number]; second: [number, number] }
> = {
  LEFT: {
    first: [cellSize * 0.2, cellSize * 0.2],
    second: [cellSize * 0.2, cellSize * 0.6],
  },
  RIGHT: {
    first: [cellSize * 0.6, cellSize * 0.2],
    second: [cellSize * 0.6, cellSize * 0.6],
  },
  UP: {
    first: [cellSize * 0.2, cellSize * 0.2],
    second: [cellSize * 0.6, cellSize * 0.2],
  },
  DOWN: {
    first: [cellSize * 0.2, cellSize * 0.6],
    second: [cellSize * 0.6, cellSize * 0.6],
  },
};

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

  ctx.rect(...eyeFirst, ...[10, 10]);
  ctx.rect(...eyeSecond, ...[10, 10]);
  ctx.fillStyle = "brown";
  ctx.strokeStyle = "red";
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
