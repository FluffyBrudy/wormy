import "../styles/ui.button.css";

export function createButton(
  text: string,
  onClick: () => void,
  variant: "default" | "primary" | "danger" = "default"
): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = `ui-btn ${variant !== "default" ? variant : ""}`;
  button.textContent = text;

  button.addEventListener("click", onClick);

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
