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

  const centerX = cellSize * foodCoor[0] + cellSize / 2;
  const centerY = cellSize * foodCoor[1] + cellSize / 2;
  const baseRadius = foods.basic;
  const radius = baseRadius * scale;

  ctx.save();

  drawApple(ctx, centerX, centerY, radius);

  ctx.restore();
}

function drawApple(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
) {
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  const bodyGradient = ctx.createRadialGradient(
    centerX - radius * 0.3,
    centerY - radius * 0.2,
    0,
    centerX,
    centerY,
    radius
  );
  bodyGradient.addColorStop(0, "#ff6b6b");
  bodyGradient.addColorStop(0.3, "#ff5252");
  bodyGradient.addColorStop(0.7, "#f44336");
  bodyGradient.addColorStop(1, "#d32f2f");

  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY + radius * 0.1,
    radius * 0.9,
    radius,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = bodyGradient;
  ctx.fill();

  ctx.shadowColor = "transparent";

  const highlightGradient = ctx.createRadialGradient(
    centerX - radius * 0.4,
    centerY - radius * 0.3,
    0,
    centerX - radius * 0.2,
    centerY - radius * 0.1,
    radius * 0.6
  );
  highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
  highlightGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
  highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.ellipse(
    centerX - radius * 0.2,
    centerY - radius * 0.1,
    radius * 0.4,
    radius * 0.6,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = highlightGradient;
  ctx.fill();

  const stemGradient = ctx.createLinearGradient(
    centerX - radius * 0.1,
    centerY - radius * 0.8,
    centerX + radius * 0.1,
    centerY - radius * 0.4
  );
  stemGradient.addColorStop(0, "#8d6e63");
  stemGradient.addColorStop(1, "#5d4037");

  ctx.fillStyle = stemGradient;
  ctx.fillRect(
    centerX - radius * 0.05,
    centerY - radius * 0.8,
    radius * 0.1,
    radius * 0.4
  );

  const leafGradient = ctx.createLinearGradient(
    centerX,
    centerY - radius * 0.8,
    centerX + radius * 0.3,
    centerY - radius * 0.6
  );
  leafGradient.addColorStop(0, "#66bb6a");
  leafGradient.addColorStop(1, "#4caf50");

  ctx.beginPath();
  ctx.ellipse(
    centerX + radius * 0.15,
    centerY - radius * 0.7,
    radius * 0.15,
    radius * 0.08,
    0.5,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = leafGradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX + radius * 0.05, centerY - radius * 0.7);
  ctx.lineTo(centerX + radius * 0.25, centerY - radius * 0.7);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.arc(
    centerX - radius * 0.3,
    centerY - radius * 0.2,
    radius * 0.08,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(
    centerX - radius * 0.1,
    centerY + radius * 0.3,
    radius * 0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const glowGradient = ctx.createRadialGradient(
    centerX,
    centerY,
    radius * 0.8,
    centerX,
    centerY,
    radius * 1.3
  );
  glowGradient.addColorStop(0, "rgba(255, 107, 107, 0)");
  glowGradient.addColorStop(1, "rgba(255, 107, 107, 0.2)");

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.fill();
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
    ulimit: 1.2,
    llimit: 0.9,
    speed: 0.02,
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
