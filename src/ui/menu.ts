import "../styles/ui.menu.css";

export class UIMenu {
  public readonly element: HTMLDivElement;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "ui-menu";
    this.hide();
  }

  add(child: HTMLElement): void {
    this.element.appendChild(child);
  }

  mount(target: HTMLElement): void {
    target.appendChild(this.element);
  }

  setAt(x: number, y: number): void {
    this.element.style.position = "absolute";

    const { width, height } = this.element.getBoundingClientRect();

    this.element.style.left = `${x - width / 2}px`;
    this.element.style.top = `${y - height / 2}px`;
  }

  clear(): void {
    this.element.innerHTML = "";
  }

  show(): void {
    this.element.style.display = "";
    this.element.setAttribute("aria-hidden", "false");
    this.element.style.pointerEvents = "auto";
  }

  hide(): void {
    this.element.style.display = "none";
    this.element.setAttribute("aria-hidden", "true");
    this.element.style.pointerEvents = "none";
  }

  resize(w: number, h: number): void {
    this.element.style.width = `${w}px`;
    this.element.style.height = `${h}px`;
    this.element.style.boxSizing = "border-box";
  }
}
