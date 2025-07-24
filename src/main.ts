import { defaultSnakeBody, HEAD, screenHeight, screenWidth } from "./constants";
import { drawFood, generateFood } from "./food";
import { drawGrid, hasCollidedWithWalls } from "./grid";
import { drawSnake, growSnake, updateSnake } from "./snake";
import "./style.css";
import { renderTextAligned } from "./text";
import type { TCoor, TDirection } from "./types";
import { UIButton } from "./ui/button";
import { isCoordinateEqual } from "./utils/math.utils";

class Game {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private fps = 10;
  private lastFrameTime = 0;
  private frameDuration = 1000 / this.fps;

  private snakeDirection: TDirection = "LEFT";
  private snakePositions: Array<TCoor> = defaultSnakeBody.slice();
  private foodPosition = generateFood(this.snakePositions);

  private isPaused = true;

  constructor() {
    console.log(this.foodPosition);

    this.canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
    this.ctx = this.canvas.getContext(
      "2d"
    ) as unknown as CanvasRenderingContext2D;

    this.loop = this.loop.bind(this);

    this.registerEvents();

    renderTextAligned(50, 50, "PRESS SPACE TO CONTINUE", "start", this.ctx);
  }

  private registerEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        this.isPaused = !this.isPaused;
        return;
      }
      if (this.isPaused) return;
      if (e.key == "ArrowLeft" && this.snakeDirection !== "RIGHT") {
        this.updateSnakeDirection("LEFT");
      } else if (e.key == "ArrowRight" && this.snakeDirection !== "LEFT") {
        this.updateSnakeDirection("RIGHT");
      } else if (e.key == "ArrowUp" && this.snakeDirection !== "DOWN") {
        this.updateSnakeDirection("UP");
      } else if (e.key == "ArrowDown" && this.snakeDirection !== "UP") {
        this.updateSnakeDirection("DOWN");
      }
    });
  }

  private handleFoodCollision() {
    const hasCollided = isCoordinateEqual(
      this.snakePositions[HEAD],
      this.foodPosition
    );
    if (hasCollided) {
      growSnake(this.snakePositions, this.snakeDirection);
      this.foodPosition = generateFood(this.snakePositions);
    }
  }

  private handleWallCollision() {
    const hasCollided = hasCollidedWithWalls(this.snakePositions[HEAD]);
    if (hasCollided) {
      this.snakePositions = defaultSnakeBody.slice();
    }
  }

  public displayWindow() {
    this.ctx.fill();
  }

  public getCanvas() {
    return this.canvas;
  }

  private updateSnakeDirection(direction: TDirection) {
    this.snakeDirection = direction;
  }

  private update() {
    updateSnake(this.snakePositions, this.snakeDirection);
    this.handleFoodCollision();
    this.handleWallCollision();
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    drawGrid(this.ctx);
    drawFood(this.ctx, this.foodPosition);
    drawSnake(this.ctx, this.snakePositions, this.snakeDirection);
  }

  private loop(currentTime: number) {
    if (this.isPaused) {
      requestAnimationFrame(this.loop);
      return;
    }
    if (currentTime - this.lastFrameTime > this.frameDuration) {
      this.lastFrameTime = currentTime;
      this.update();
      this.draw();
    }
    requestAnimationFrame(this.loop);
  }

  public run() {
    requestAnimationFrame(this.loop);
  }
}

function initCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = screenWidth;
  canvas.height = screenHeight;
  document.querySelector("#app")?.appendChild(canvas);
}

initCanvas();

const game = new Game();
game.run();
