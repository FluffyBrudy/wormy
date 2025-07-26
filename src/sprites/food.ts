import { cellSize, foods, gridHeight, gridWidth, INVALID } from "../constants";
import type { TCoor } from "../types";
import { choice, shuffle } from "../utils/random";

export function drawFood(
  ctx: CanvasRenderingContext2D,
  foodCoor: TCoor,
  scale = 1
) {
  if (!foodCoor) {
    alert(`${foodCoor}`);
    throw new Error("not valid coor");
  }
  const x = cellSize * foodCoor[0] + cellSize / 2;
  const y = cellSize * foodCoor[1] + cellSize / 2;
  ctx.beginPath();
  ctx.arc(x, y, foods.basic * scale, 0, 2 * Math.PI);
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

export function foodAnimationHandler() {
  const animAttrs = {
    scale: 1,
    dir: -1,
    ulimit: 1,
    llimit: 0.5,
    speed: 0.05,
    animate() {
      if (this.scale > this.ulimit) {
        this.dir *= -1;
        this.scale = this.ulimit;
      } else if (this.scale < this.llimit) {
        this.dir *= -1;
        this.scale = this.llimit;
      }
      this.scale += this.speed * this.dir;
    },
    getScale() {
      return this.scale;
    },
  };

  return {
    animate: animAttrs.animate.bind(animAttrs),
    getScale: animAttrs.getScale.bind(animAttrs),
  };
}
