import { cellSize } from "../constants";
import type { TCoor } from "../types";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public createFoodParticles(position: TCoor) {
    const [gridX, gridY] = position;
    const centerX = gridX * cellSize + cellSize / 2;
    const centerY = gridY * cellSize + cellSize / 2;

    const colors = ["#ff4757", "#ff6b7a", "#ffa502", "#ffdd59"];

    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 2 + Math.random() * 3;

      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 2,
      });
    }
  }

  public createCollisionParticles(position: TCoor) {
    const [gridX, gridY] = position;
    const centerX = gridX * cellSize + cellSize / 2;
    const centerY = gridY * cellSize + cellSize / 2;

    const colors = ["#ff4757", "#ff3838", "#c44569"];

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;

      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 40,
        maxLife: 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 3,
      });
    }
  }

  public update() {
    this.particles = this.particles.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.life--;

      return particle.life > 0;
    });
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * alpha;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  public clear() {
    this.particles = [];
  }
}
