import "../styles/ui.button.css";

export function createButton(
  text: string,
  onClick: (e: MouseEvent) => void,
  variant: "default" | "primary" | "danger" = "default"
): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = `ui-btn ${variant !== "default" ? variant : ""}`;
  button.textContent = text;

  button.addEventListener("click", (e) => {
    const ripple = document.createElement("span");
    ripple.className = "ripple";

    const rect = button.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left - 10}px`;
    ripple.style.top = `${e.clientY - rect.top - 10}px`;

    button.appendChild(ripple);

    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });

    onClick(e);
  });

  button.addEventListener("mouseenter", (e) => {
    const ripple = document.createElement("span");
    ripple.className = "ripple";

    const rect = button.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left - 10}px`;
    ripple.style.top = `${e.clientY - rect.top - 10}px`;

    button.appendChild(ripple);

    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  });

  return button;
}

export function changeButtonText(button: HTMLButtonElement, text: string) {
  button.textContent = text;
}
