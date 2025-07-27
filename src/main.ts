import {
  defaultDir,
  defaultSnakeBody,
  eventDelay,
  HEAD,
  screenHeight,
  screenWidth,
} from "./constants";
import { drawFood, foodAnimationHandler, generateFood } from "./sprites/food";
import { drawGrid, hasCollidedWithWalls } from "./sprites/grid";
import {
  drawSnake,
  growSnake,
  hasCollidedWithSelf,
  updateSnake,
} from "./sprites/snake";
import type { TCallbackMap, TCoor, TDirection } from "./types";
import { createButton } from "./ui/button";
import { UIMenu } from "./ui/menu";
import { isCoordinateEqual } from "./utils/math.utils";
import "./style.css";
import { ScoreDisplay } from "./ui/score-display";
import { GameOverlay } from "./ui/game-overlay";
import { GameOverScreen } from "./ui/game-over-screen";
import { SoundManager } from "./audio/sound-manager";
import { ParticleSystem } from "./effects/particle-system";
import { ScreenShake } from "./effects/screen-shake";
import { drawFoggyBackground } from "./environments/foggy-env";

class Game {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private fps = 10;
  private lastFrameTime = 0;
  private frameDuration = 1000 / this.fps;

  private snakeDirection: TDirection = defaultDir;
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
  private gameOverScreen: GameOverScreen;
  private soundManager: SoundManager;
  private particleSystem: ParticleSystem;
  private screenShake: ScreenShake;
  private gameStartTime = 0;
  private maxSnakeLength = 3;

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
    this.gameOverScreen = new GameOverScreen();
    this.soundManager = new SoundManager();
    this.particleSystem = new ParticleSystem();
    this.screenShake = new ScreenShake();
  }

  public setDifficulty(mode: "easy" | "normal" | "hard") {
    const choices = { easy: 10, normal: 14, hard: 18 };
    this.fps = choices[mode];
    this.frameDuration = 1000 / this.fps;
    console.log(this.frameDuration);
  }

  public startGame() {
    this.isStarted = true;
    this.gameStartTime = Date.now();
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
    this.snakeDirection = defaultDir;
    this.snakePositions = defaultSnakeBody.slice();
    this.foodCounts.basic = 0;
    this.maxSnakeLength = 3;
    this.scoreDisplay.reset();
    this.isPaused = false;
    this.isStarted = false;
    this.particleSystem.clear();
    this.foodPosition = generateFood(this.snakePositions);
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
      this.soundManager.play("eat");
      this.particleSystem.createFoodParticles(this.foodPosition);
      growSnake(this.snakePositions);
      this.foodCounts.basic += 1;
      this.maxSnakeLength = Math.max(
        this.maxSnakeLength,
        this.snakePositions.length
      );
      this.scoreDisplay.updateScore(this.foodCounts.basic);
      this.foodPosition = generateFood(this.snakePositions);
    }
  }

  private handleWallCollision() {
    const hasCollided = hasCollidedWithWalls(this.snakePositions[HEAD]);
    if (hasCollided) {
      this.particleSystem.createCollisionParticles(this.snakePositions[HEAD]);
      this.screenShake.shake(10, 20);
      this.soundManager.play("gameOver");
      this.isStarted = false;
      this.isPaused = true;
      this.callbackMap.over();
    }
  }

  private handleSelfCOllision() {
    const hasCollided = hasCollidedWithSelf(this.snakePositions);
    if (hasCollided) {
      this.particleSystem.createCollisionParticles(this.snakePositions[HEAD]);
      this.screenShake.shake(8, 15);
      this.soundManager.play("gameOver");
      this.isStarted = false;
      this.isPaused = true;
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
    this.particleSystem.update();
    this.screenShake.update();
    this.handleFoodCollision();
    this.handleWallCollision();
    this.handleSelfCOllision();
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const [shakeX, shakeY] = this.screenShake.getOffset();
    this.ctx.save();
    this.ctx.translate(shakeX, shakeY);

    drawFoggyBackground(this.ctx);
    drawGrid(this.ctx);
    drawFood(this.ctx, this.foodPosition, this.foodAnimationHandler.getScale());
    drawSnake(this.ctx, this.snakePositions, this.snakeDirection);
    this.particleSystem.draw(this.ctx);

    this.ctx.restore();
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

  public getGameStats() {
    const currentTime = Date.now();
    const timeSurvived = Math.floor((currentTime - this.gameStartTime) / 1000);
    const highScore = Number.parseInt(
      localStorage.getItem("snake-high-score") || "0"
    );
    const isNewHighScore = this.foodCounts.basic > highScore;

    return {
      finalScore: this.foodCounts.basic,
      highScore: Math.max(highScore, this.foodCounts.basic),
      timeSurvived,
      foodsEaten: this.foodCounts.basic,
      maxLength: this.maxSnakeLength,
      isNewHighScore,
    };
  }

  public getGameOverScreen() {
    return this.gameOverScreen;
  }

  public getSoundManager() {
    return this.soundManager;
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
        this.game.getSoundManager().play("click");
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
    this.startMenu.add(
      createButton("🔊 Sound: ON", (event: MouseEvent) => {
        const isEnabled = this.game.getSoundManager().toggle();
        const button = event.target as HTMLButtonElement;
        button.textContent = isEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
      })
    );

    this.pauseMenu.add(
      createButton("Resume", () => {
        this.game.getSoundManager().play("click");
        this.game.resumeGame();
        this.pauseMenu.hide();
      })
    );
    this.pauseMenu.add(
      createButton("Main Menu", () => {
        this.game.getSoundManager().play("click");
        this.pauseMenu.hide();
        this.startMenu.show();
        this.game.resetAttributes();
      })
    );

    this.startMenu.mount(document.body);
    this.pauseMenu.mount(document.body);
    this.startMenu.show();
    this.pauseMenu.hide();

    this.game.getGameOverScreen().mount(document.body);
    this.game.getGameOverScreen().onTryAgain(() => {
      this.game.getSoundManager().play("click");
      this.game.getGameOverScreen().hide();
      this.game.resetAttributes();
      this.game.startGame();
    });

    this.game.getGameOverScreen().onMainMenu(() => {
      this.game.getSoundManager().play("click");
      this.game.getGameOverScreen().hide();
      this.game.resetAttributes();
      this.startMenu.show();
    });

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
      over: () => {
        const stats = this.game.getGameStats();
        if (stats.isNewHighScore) {
          this.game.getSoundManager().play("highScore");
        }
        setTimeout(() => {
          this.game.getGameOverScreen().show(stats);
        }, 500);
      },
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
