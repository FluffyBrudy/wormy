import "../styles/ui.game-over-screen.css";

export class GameOverScreen {
  private element: HTMLDivElement;
  private finalScoreElement!: HTMLSpanElement;
  private highScoreElement!: HTMLSpanElement;
  public gameStatsElement!: HTMLDivElement;
  public isNewHighScore = false;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "game-over-screen";
    this.createElement();
    this.startParticleSystem();
  }

  private createElement() {
    this.element.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-content">
          <div class="skull-animation">💀</div>
          <h1 class="game-over-title">GAME OVER</h1>
          <div class="score-section">
            <div class="final-score">
              <span class="score-label">FINAL SCORE</span>
              <span class="score-value" id="final-score">0</span>
            </div>
            <div class="high-score-display">
              <span class="score-label">BEST SCORE</span>
              <span class="score-value" id="game-over-high-score">0</span>
            </div>
          </div>
          <div class="game-stats" id="game-stats">
            <div class="stat-item">
              <span class="stat-label">TIME SURVIVED</span>
              <span class="stat-value" id="time-survived">0:00</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">FOODS EATEN</span>
              <span class="stat-value" id="foods-eaten">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">MAX LENGTH</span>
              <span class="stat-value" id="max-length">3</span>
            </div>
          </div>
          <div class="button-container">
            <button class="game-over-btn try-again-btn" id="try-again">
              <span class="btn-icon">🔄</span>
              TRY AGAIN
            </button>
            <button class="game-over-btn main-menu-btn" id="main-menu">
              <span class="btn-icon">🏠</span>
              MAIN MENU
            </button>
          </div>
          <div class="motivational-text" id="motivational-text">
            Better luck next time!
          </div>
        </div>
        <div class="particle-container"></div>
        <div class="lightning-container"></div>
      </div>
    `;

    this.finalScoreElement = this.element.querySelector(
      "#final-score"
    ) as HTMLSpanElement;
    this.highScoreElement = this.element.querySelector(
      "#game-over-high-score"
    ) as HTMLSpanElement;
    this.gameStatsElement = this.element.querySelector(
      "#game-stats"
    ) as HTMLDivElement;
  }

  private startParticleSystem() {
    const particleContainer = this.element.querySelector(
      ".particle-container"
    ) as HTMLElement;

    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "death-particle";

      const colors = ["#ff4757", "#ff3838", "#ff6b7a", "#c44569"];
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];

      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = 2 + Math.random() * 3 + "s";
      particle.style.animationDelay = Math.random() * 2 + "s";

      particleContainer.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 5000);
    };

    setInterval(createParticle, 300);
  }

  private createLightningEffect() {
    const lightningContainer = this.element.querySelector(
      ".lightning-container"
    ) as HTMLElement;

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const lightning = document.createElement("div");
        lightning.className = "lightning-bolt";
        lightning.style.left = Math.random() * 100 + "%";
        lightning.style.animationDelay = Math.random() * 0.5 + "s";

        lightningContainer.appendChild(lightning);

        setTimeout(() => {
          lightning.remove();
        }, 1000);
      }, i * 200);
    }
  }

  private getMotivationalText(score: number, isNewHighScore: boolean): string {
    if (isNewHighScore) {
      return "A new high score? About time you did something right...";
    }

    if (score === 0) {
      return "Zero again? Maybe this just isn’t your thing.";
    } else if (score < 5) {
      return "Is that all you got? Even a turtle beats you.";
    } else if (score < 10) {
      return "Still struggling, huh? You call that effort?";
    } else if (score < 20) {
      return "Barely scraping by. Step it up or give up.";
    } else {
      const snarkyMessages = [
        "Wow, look at you... barely above average.",
        "Congrats on mediocrity. Try harder next time.",
        "Your snake is slow. Is it tired or just lazy?",
        "Don’t get cocky, that was nothing special.",
        "Keep dreaming if you think that’s good.",
        "A snail could beat that score on a good day.",
        "If I were you, I’d rethink my life choices.",
        "Not impressed. Try again, maybe someday you'll improve.",
      ];
      return snarkyMessages[Math.floor(Math.random() * snarkyMessages.length)];
    }
  }

  public show(gameStats: {
    finalScore: number;
    highScore: number;
    timeSurvived: number;
    foodsEaten: number;
    maxLength: number;
    isNewHighScore: boolean;
  }) {
    this.isNewHighScore = gameStats.isNewHighScore;

    this.finalScoreElement.textContent = gameStats.finalScore.toString();
    this.highScoreElement.textContent = gameStats.highScore.toString();

    const minutes = Math.floor(gameStats.timeSurvived / 60);
    const seconds = gameStats.timeSurvived % 60;
    const timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    (this.element.querySelector("#time-survived") as HTMLElement).textContent =
      timeText;
    (this.element.querySelector("#foods-eaten") as HTMLElement).textContent =
      gameStats.foodsEaten.toString();
    (this.element.querySelector("#max-length") as HTMLElement).textContent =
      gameStats.maxLength.toString();

    const motivationalElement = this.element.querySelector(
      "#motivational-text"
    ) as HTMLElement;
    motivationalElement.textContent = this.getMotivationalText(
      gameStats.finalScore,
      gameStats.isNewHighScore
    );

    if (gameStats.isNewHighScore) {
      this.element.classList.add("new-high-score");
      this.createLightningEffect();
      motivationalElement.classList.add("celebration");
    } else {
      this.element.classList.remove("new-high-score");
      motivationalElement.classList.remove("celebration");
    }

    this.element.style.display = "flex";

    setTimeout(() => {
      this.element.classList.add("show");
    }, 100);
  }

  public hide() {
    this.element.classList.remove("show");
    setTimeout(() => {
      this.element.style.display = "none";
    }, 300);
  }

  public mount(target: HTMLElement) {
    target.appendChild(this.element);
  }

  public onTryAgain(callback: () => void) {
    const tryAgainBtn = this.element.querySelector(
      "#try-again"
    ) as HTMLButtonElement;
    tryAgainBtn.addEventListener("click", callback);
  }

  public onMainMenu(callback: () => void) {
    const mainMenuBtn = this.element.querySelector(
      "#main-menu"
    ) as HTMLButtonElement;
    mainMenuBtn.addEventListener("click", callback);
  }
}
