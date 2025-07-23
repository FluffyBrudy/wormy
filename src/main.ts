import { drawFood, generateFood } from "./food";
import { drawGrid } from "./grid";
import { drawSnake, updateSnake } from "./snake";
import "./style.css";
import type { TCoor, TDirection } from "./types";

class Game {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private fps = 10;
  private lastFrameTime = 0;
  private frameDuration = 1000 / this.fps;

  private snakeDirection: TDirection = "LEFT";
  private snakePositions: Array<TCoor> = [
    [5, 5],
    [6, 5],
    [6, 6],
  ];
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
  }

  private registerEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        this.isPaused = !this.isPaused;
        return;
      }

      if (e.key == "ArrowLeft") {
        this.updateSnakeDirection("LEFT");
      } else if (e.key == "ArrowRight") {
        this.updateSnakeDirection("RIGHT");
      } else if (e.key == "ArrowUp") {
        this.updateSnakeDirection("UP");
      } else if (e.key == "ArrowDown") {
        this.updateSnakeDirection("DOWN");
      }
    });
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

  public update() {
    updateSnake(this.snakePositions, this.snakeDirection);
  }

  public draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    drawGrid(this.ctx);
    drawFood(this.ctx, this.foodPosition);
    drawSnake(this.ctx, this.snakePositions, this.snakeDirection);
  }

  public loop(currentTime: number) {
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

const game = new Game();
game.run();
