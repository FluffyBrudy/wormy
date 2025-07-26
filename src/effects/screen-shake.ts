export class ScreenShake {
  private intensity = 0;
  private duration = 0;
  private currentTime = 0;

  public shake(intensity: number, duration: number) {
    this.intensity = intensity;
    this.duration = duration;
    this.currentTime = 0;
  }

  public update() {
    if (this.currentTime < this.duration) {
      this.currentTime++;
      return true;
    }
    return false;
  }

  public getOffset(): [number, number] {
    if (this.currentTime >= this.duration) return [0, 0];

    const progress = this.currentTime / this.duration;
    const currentIntensity = this.intensity * (1 - progress);

    return [
      (Math.random() - 0.5) * currentIntensity * 2,
      (Math.random() - 0.5) * currentIntensity * 2,
    ];
  }
}
