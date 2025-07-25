import "../styles/ui.score-display.css";

export class ScoreDisplay {
  private element: HTMLDivElement;
  private scoreValue!: HTMLSpanElement;
  private highScoreValue!: HTMLSpanElement;
  private currentScore = 0;
  private highScore = 0;
  private animationId: number | null = null;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "score-display";

    this.highScore = Number.parseInt(
      localStorage.getItem("snake-high-score") || "0"
    );

    this.createElement();
  }

  private createElement() {
    this.element.innerHTML = `
      <div class="score-container">
        <div class="score-item current-score">
          <div class="score-label">SCORE</div>
          <div class="score-value" id="current-score">0</div>
          <div class="score-glow"></div>
        </div>
        <div class="score-divider"></div>
        <div class="score-item high-score">
          <div class="score-label">BEST</div>
          <div class="score-value" id="high-score">${this.highScore}</div>
          <div class="score-glow"></div>
        </div>
      </div>
      <div class="score-particles"></div>
    `;

    this.scoreValue = this.element.querySelector(
      "#current-score"
    ) as HTMLSpanElement;
    this.highScoreValue = this.element.querySelector(
      "#high-score"
    ) as HTMLSpanElement;
  }

  public updateScore(score: number) {
    const oldScore = this.currentScore;
    this.currentScore = score;

    this.animateScoreChange(oldScore, score);

    if (score > this.highScore) {
      this.highScore = score;
      this.highScoreValue.textContent = score.toString();
      localStorage.setItem("snake-high-score", score.toString());
      this.triggerHighScoreEffect();
    }

    if (score > oldScore) {
      this.createScoreParticles();
    }
  }

  private animateScoreChange(from: number, to: number) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    const duration = 300;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(from + (to - from) * easeOut);

      this.scoreValue.textContent = currentValue.toString();

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private triggerHighScoreEffect() {
    const highScoreElement = this.element.querySelector(
      ".high-score"
    ) as HTMLElement;
    highScoreElement.classList.add("new-high-score");

    this.createCelebrationParticles();

    setTimeout(() => {
      highScoreElement.classList.remove("new-high-score");
    }, 2000);
  }

  private createScoreParticles() {
    const particlesContainer = this.element.querySelector(
      ".score-particles"
    ) as HTMLElement;

    for (let i = 0; i < 5; i++) {
      const particle = document.createElement("div");
      particle.className = "score-particle";
      particle.textContent = "+1";

      const angle = (Math.PI * 2 * i) / 5;
      const distance = 50 + Math.random() * 30;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.style.setProperty("--x", `${x}px`);
      particle.style.setProperty("--y", `${y}px`);

      particlesContainer.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }

  private createCelebrationParticles() {
    const particlesContainer = this.element.querySelector(
      ".score-particles"
    ) as HTMLElement;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.className = "celebration-particle";

      const angle = (Math.PI * 2 * i) / 20;
      const distance = 80 + Math.random() * 50;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.style.setProperty("--x", `${x}px`);
      particle.style.setProperty("--y", `${y}px`);
      particle.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;

      particlesContainer.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 2000);
    }
  }

  public mount(target: HTMLElement) {
    target.appendChild(this.element);
  }

  public show() {
    this.element.style.display = "block";
  }

  public hide() {
    this.element.style.display = "none";
  }

  public reset() {
    this.currentScore = 0;
    this.scoreValue.textContent = "0";
  }

  public setAt(anchoredX: number, topY: number) {
    this.element.style.position = "absolute";
    this.element.style.left = `${anchoredX - this.element.clientWidth / 2}px`;
    this.element.style.top = `${topY - this.element.clientHeight}px`;
  }
}
