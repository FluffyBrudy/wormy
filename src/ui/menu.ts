import "../styles/ui.menu.css";
import { createButton } from "./button";

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

  addRadioOptions(
    toggleBtnLabel: string,
    callback: Record<string, CallableFunction>
  ): void {
    const container = document.createElement("div");
    container.className = "radio-options-container";

    const toggleBtn = createButton(toggleBtnLabel, () => {
      const isVisible = btnGroup.style.display === "flex";
      btnGroup.style.display = isVisible ? "none" : "flex";
    });

    container.appendChild(toggleBtn);

    const btnGroup = document.createElement("div");
    btnGroup.className = "radio-options-group";
    btnGroup.style.display = "none";

    let selectedBtn: HTMLButtonElement | null = null;

    Object.entries(callback).forEach(([key, cb]) => {
      const btn = document.createElement("button");
      btn.textContent = key;
      btn.className = "radio-button ui-btn";

      btn.onclick = () => {
        if (selectedBtn) {
          selectedBtn.classList.remove("selected");
        }
        btn.classList.add("selected");
        selectedBtn = btn;
        cb(key);
      };

      btnGroup.appendChild(btn);
    });

    container.appendChild(btnGroup);
    this.element.appendChild(container);
  }

  mount(target: HTMLElement): void {
    target.appendChild(this.element);
  }

  setAt(x: number, y: number): void {
    this.element.style.position = "absolute";

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.transform = "translate(-50%,-50%)";
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
