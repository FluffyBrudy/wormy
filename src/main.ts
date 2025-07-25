import {
  defaultSnakeBody,
  eventDelay,
  HEAD,
  screenHeight,
  screenWidth,
} from "./constants";
import { drawFood, foodAnimationHandler, generateFood } from "./food";
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
  private foodAnimationHandler: ReturnType<typeof foodAnimationHandler>;
  private foodCounts = { basic: 0 };

  private isPaused = false;
  private isStarted = false;

  private onPauseCallback: CallableFunction | null = null;

  constructor() {
    this.foodAnimationHandler = foodAnimationHandler();
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

  public setDifficulty(mode: "easy" | "normal" | "hard") {
    const choices = { easy: 10, normal: 14, hard: 18 };
    this.fps = choices[mode];
    this.frameDuration = 1000 / this.fps;
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

  public resetAttributes() {
    this.snakeDirection = "LEFT";
    this.snakePositions = defaultSnakeBody.slice();
    this.foodCounts.basic = 0;
  }

  getFoodsCount() {
    return this.foodCounts;
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
      this.foodCounts.basic += 1;
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
    this.foodAnimationHandler.animate();
    this.handleFoodCollision();
    this.handleWallCollision();
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    drawGrid(this.ctx);
    drawFood(this.ctx, this.foodPosition, this.foodAnimationHandler.getScale());
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

  private eventTimer = 0;

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
      easy: () => this.game.setDifficulty("easy"),
      normal: () => this.game.setDifficulty("normal"),
      hard: () => this.game.setDifficulty("hard"),
    });

    this.pauseMenu.add(
      createButton("Resume", () => {
        this.game.resumeGame();
        this.pauseMenu.hide();
      })
    );
    this.pauseMenu.add(
      createButton("Main Menu", () => {
        this.pauseMenu.hide();
        this.startMenu.show();
      })
    );

    this.startMenu.mount(document.body);
    this.pauseMenu.mount(document.body);
    this.startMenu.show();
    this.pauseMenu.hide();

    requestAnimationFrame(() => {
      this.startMenu.resize(canvasRect.width + 10, canvasRect.height + 10);
    });

    this.game.setOnPauseCallback(() => {
      this.pauseMenu.show();
    });
    this.registerEvents();
    this.game.run();
  }

  private initCanvas() {
    const canvas = document.createElement("canvas");
    window.addEventListener("reset", () => {
      canvas.width = screenWidth;
      canvas.height = screenHeight;
    });
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    document.querySelector("#app")?.appendChild(canvas);
    const { right, bottom, width, height } = canvas.getBoundingClientRect();
    return { right, bottom, width, height };
  }

  private registerEvents() {
    window.addEventListener("keydown", (e) => {
      const timeDiff = Date.now() - this.eventTimer;
      if (timeDiff < eventDelay) return;
      this.eventTimer = Date.now();
      const { isPaused, isStarted } = this.game.getGameStatus();
      console.log(e.key);
      if (e.key === "Escape") {
        if (!isPaused) {
          this.game.pauseGame();
          this.pauseMenu.show();
        }
        return;
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
