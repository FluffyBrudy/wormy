import { defaultSnakeBody, HEAD, screenHeight, screenWidth } from "./constants";
import { drawFood, generateFood } from "./food";
import { drawGrid, hasCollidedWithWalls } from "./grid";
import { drawSnake, growSnake, updateSnake } from "./snake";
import type { TCoor, TDirection } from "./types";
import { createButton } from "./ui/button";
import { UIMenu } from "./ui/menu";
import { isCoordinateEqual } from "./utils/math.utils";
import "./style.css";

class Game {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private fps = 10;
  private lastFrameTime = 0;
  private frameDuration = 1000 / this.fps;

  private snakeDirection: TDirection = "LEFT";
  private snakePositions: Array<TCoor> = defaultSnakeBody.slice();
  private foodPosition = generateFood(this.snakePositions);

  private isPaused = false;
  private isStarted = false;

  private onPauseCallback: CallableFunction | null = null;

  constructor() {
    console.log(this.foodPosition);

    this.canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
    this.ctx = this.canvas.getContext(
      "2d"
    ) as unknown as CanvasRenderingContext2D;

    this.ctx.beginPath();
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.closePath();

    this.loop = this.loop.bind(this);
  }

  public startGame() {
    this.isStarted = true;
  }

  public pauseGame() {
    if (!this.isStarted) return;
    this.isPaused = true;
    this.onPauseCallback?.();
  }

  public resumeGame() {
    if (!this.isStarted) return;
    this.isPaused = false;
  }

  public getGameStatus() {
    return {
      isStarted: this.isStarted,
      isPaused: this.isPaused,
    };
  }

  public setOnPauseCallback(callback: CallableFunction) {
    this.onPauseCallback = callback;
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
      this.isPaused = true;
      this.onPauseCallback?.();
    }
  }

  public displayWindow() {
    this.ctx.fill();
  }

  public getCanvas() {
    return this.canvas;
  }

  public updateSnakeDirection(direction: TDirection) {
    this.snakeDirection = direction;
  }

  public getSnakeDirection() {
    return this.snakeDirection;
  }

  private update() {
    if (this.isPaused || !this.isStarted) return;
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
    if (!this.isStarted) {
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

class GameController {
  private game: Game;
  private startMenu: UIMenu;
  private pauseMenu: UIMenu;

  constructor() {
    const canvasRect = this.initCanvas();

    this.game = new Game();
    this.startMenu = new UIMenu();
    this.pauseMenu = new UIMenu();

    this.startMenu.add(
      createButton("Start", () => {
        this.game.startGame();
        this.startMenu.hide();
      })
    );
    this.startMenu.addRadioOptions("Difficulty", {
      easy: () => console.log("easy"),
      normal: () => console.log("normal"),
      hard: () => console.log("hard"),
    });

    this.pauseMenu.add(
      createButton("Resume", () => {
        this.game.resumeGame();
        this.pauseMenu.hide();
      })
    );

    this.startMenu.mount(document.body);
    this.pauseMenu.mount(document.body);
    this.startMenu.show();
    this.pauseMenu.hide();

    requestAnimationFrame(() => {
      this.startMenu.resize(canvasRect.width + 10, canvasRect.height + 10);
      this.startMenu.setAt(
        canvasRect.right - canvasRect.width / 2,
        canvasRect.bottom - canvasRect.height / 2
      );
      this.pauseMenu.setAt(
        canvasRect.right - canvasRect.width / 2,
        canvasRect.bottom - canvasRect.height / 2
      );
    });

    this.game.setOnPauseCallback(() => {
      this.pauseMenu.show();
    });
    this.registerEvents();
    this.game.run();
  }

  private initCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    document.querySelector("#app")?.appendChild(canvas);
    const { right, bottom, width, height } = canvas.getBoundingClientRect();
    return { right, bottom, width, height };
  }

  private registerEvents() {
    window.addEventListener("keydown", (e) => {
      const { isPaused, isStarted } = this.game.getGameStatus();

      if (e.key === "Escape") {
        if (isPaused) {
          this.game.resumeGame();
          this.pauseMenu.hide();
        } else {
          this.game.pauseGame();
          this.pauseMenu.show();
        }
      }

      if (isPaused || !isStarted) return;
      const snakeDirection = this.game.getSnakeDirection();
      if (e.key == "ArrowLeft" && snakeDirection !== "RIGHT") {
        this.game.updateSnakeDirection("LEFT");
      } else if (e.key == "ArrowRight" && snakeDirection !== "LEFT") {
        this.game.updateSnakeDirection("RIGHT");
      } else if (e.key == "ArrowUp" && snakeDirection !== "DOWN") {
        this.game.updateSnakeDirection("UP");
      } else if (e.key == "ArrowDown" && snakeDirection !== "UP") {
        this.game.updateSnakeDirection("DOWN");
      }
    });
  }
}

new GameController();
