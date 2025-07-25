import {
  defaultSnakeBody,
  eventDelay,
  HEAD,
  screenHeight,
  screenWidth,
} from "./constants";
import { drawFood, foodAnimationHandler, generateFood } from "./food";
import { drawGrid, hasCollidedWithWalls } from "./grid";
import {
  drawSnake,
  growSnake,
  hasCollidedWithSelf,
  updateSnake,
} from "./snake";
import type { TCallbackMap, TCoor, TDirection } from "./types";
import { createButton } from "./ui/button";
import { UIMenu } from "./ui/menu";
import { isCoordinateEqual } from "./utils/math.utils";
import "./style.css";
import { ScoreDisplay } from "./ui/score-display";
import { GameOverlay } from "./ui/game-overlay";

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

  private callbackMap: TCallbackMap = {
    pause: () => "Abstracted, passed externally",
    over: () => "Abstracted, pass externallyx",
  };

  private scoreDisplay: ScoreDisplay;

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
    this.scoreDisplay = new ScoreDisplay();
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
    this.callbackMap.pause();
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
    this.scoreDisplay.reset();
  }

  getFoodsCount() {
    return this.foodCounts;
  }

  public setCallbacks(callbacksMap: TCallbackMap) {
    this.callbackMap.pause = callbacksMap.pause;
    this.callbackMap.over = callbacksMap.over;
  }

  private handleFoodCollision() {
    const hasCollided = isCoordinateEqual(
      this.snakePositions[HEAD],
      this.foodPosition
    );
    if (hasCollided) {
      growSnake(this.snakePositions, this.snakeDirection);
      this.foodCounts.basic += 1;
      this.scoreDisplay.updateScore(this.foodCounts.basic);
      this.foodPosition = generateFood(this.snakePositions);
    }
  }

  private handleWallCollision() {
    const hasCollided = hasCollidedWithWalls(this.snakePositions[HEAD]);
    if (hasCollided) {
      this.snakePositions = defaultSnakeBody.slice();
      this.isPaused = true;
      this.callbackMap.pause();
    }
  }

  private handleSelfCOllision() {
    const hasCollided = hasCollidedWithSelf(this.snakePositions);
    if (hasCollided) {
      this.callbackMap.over();
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
    this.handleSelfCOllision();
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

  public getScoreDisplay() {
    return this.scoreDisplay;
  }
}

class GameController {
  private game: Game;
  private startMenu: UIMenu;
  private pauseMenu: UIMenu;

  private eventTimer = 0;
  private canvasRect: ReturnType<typeof this.initCanvas>;

  constructor() {
    const canvasRect = this.initCanvas();
    this.canvasRect = canvasRect;

    this.game = new Game();
    const gameOverlay = new GameOverlay();
    gameOverlay.mount(document.body);

    this.game.getScoreDisplay().mount(document.body);
    this.game.getScoreDisplay().show();

    this.startMenu = new UIMenu();
    this.pauseMenu = new UIMenu();

    this.startMenu.add(
      createButton("Start", () => {
        this.game.startGame();
        this.startMenu.hide();
        gameOverlay.hide();
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
        this.game.resetAttributes();
      })
    );

    this.startMenu.mount(document.body);
    this.pauseMenu.mount(document.body);
    this.startMenu.show();
    this.pauseMenu.hide();

    requestAnimationFrame(() => {
      this.startMenu.resize(canvasRect.width + 10, canvasRect.height + 10);
      this.startMenu.setAt(
        this.canvasRect.left + this.canvasRect.width / 2,
        this.canvasRect.top + this.canvasRect.height / 2
      );
      this.pauseMenu.setAt(
        this.canvasRect.left + this.canvasRect.width / 2,
        this.canvasRect.top + this.canvasRect.height / 2
      );
      this.game
        .getScoreDisplay()
        .setAt(
          this.canvasRect.left + canvasRect.width / 2,
          this.canvasRect.top
        );
    });

    this.game.setCallbacks({
      pause: () => this.pauseMenu.show(),
      over: () => this.startMenu.show(),
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
    return canvas.getBoundingClientRect();
  }

  private registerEvents() {
    window.addEventListener("keydown", (e) => {
      const timeDiff = Date.now() - this.eventTimer;
      if (timeDiff < eventDelay) return;
      this.eventTimer = Date.now();

      const { isPaused, isStarted } = this.game.getGameStatus();

      if (e.key === "Escape" && isStarted) {
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

window.onload = () => {
  new GameController();
};
