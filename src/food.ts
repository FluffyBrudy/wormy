import { cellSize, foods, gridHeight, gridWidth, INVALID } from "./constants";
import type { TCoor } from "./types";
import { choice, shuffle } from "./utils/random";

export function drawFood(ctx: CanvasRenderingContext2D, foodCoor: TCoor) {
  if (!foodCoor) {
    alert(`${foodCoor}`);
    throw new Error("not valid coor");
  }
  const x = cellSize * foodCoor[0] + cellSize / 2;
  const y = cellSize * foodCoor[1] + cellSize / 2;
  ctx.beginPath();
  ctx.arc(x, y, foods.basic, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();
}

export function generateFood(snakePosition: Array<TCoor>): TCoor {
  const snakeSet = new Set(snakePosition.map(([x, y]) => `${x},${y}`));
  const freeCell: TCoor[] = [];

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const strCoor = `${col},${row}`;
      if (!snakeSet.has(strCoor)) {
        freeCell.push([col, row]);
      }
    }
  }

  if (freeCell.length === 0) return [INVALID, INVALID];
  return choice(shuffle(freeCell));
}
