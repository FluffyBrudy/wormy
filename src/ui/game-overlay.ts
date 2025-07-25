import "../styles/ui.game-overlay.css";

export class GameOverlay {
  private element: HTMLDivElement;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "game-overlay";
    this.createElement();
    this.startParticleSystem();
  }

  private createElement() {
    this.element.innerHTML = `
      <div class="overlay-content">
        <div class="game-title">
          <h1>WORMY</h1>
          <div class="title-glow"></div>
        </div>
        <div class="game-subtitle">The Ultimate Snake Experience</div>
        <div class="particle-container"></div>
      </div>
    `;
  }

  private startParticleSystem() {
    const particleContainer = this.element.querySelector(
      ".particle-container"
    ) as HTMLElement;

    setInterval(() => {
      this.createParticle(particleContainer);
    }, 200);
  }

  private createParticle(container: HTMLElement) {
    const particle = document.createElement("div");
    particle.className = "floating-particle";

    const colors = ["#00ff7f", "#00bfff", "#ff00ff", "#ffff00"];
    particle.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDuration = 3 + Math.random() * 4 + "s";
    particle.style.animationDelay = Math.random() * 2 + "s";

    container.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 7000);
  }

  public mount(target: HTMLElement) {
    target.appendChild(this.element);
  }

  public show() {
    this.element.style.display = "flex";
  }

  public hide() {
    this.element.style.display = "none";
  }
}
