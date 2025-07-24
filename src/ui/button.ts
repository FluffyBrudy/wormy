export function UIButton(
  label: string,
  onClick?: () => void
): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = label;
  button.className = "awesome-btn";

  if (onClick) {
    button.addEventListener("click", onClick);
  }

  button.addEventListener("click", (e: MouseEvent) => {
    const ripple = document.createElement("span");
    ripple.className = "ripple";

    const rect = button.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });

  if (!document.getElementById("awesome-btn-style")) {
    const style = document.createElement("style");
    style.id = "awesome-btn-style";
    style.textContent = `
      .awesome-btn {
        position: relative;
        overflow: hidden;
        padding: 10px 20px;
        font-size: 16px;
        color: white;
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        outline: none;
        transition: transform 0.1s ease-in-out, box-shadow 0.2s;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }

      .awesome-btn:hover {
        transform: scale(1.03);
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      }

      .awesome-btn:active {
        transform: scale(0.97);
      }

      .awesome-btn .ripple {
        position: absolute;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        pointer-events: none;
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
      }

      @keyframes ripple-animation {
        to {
          transform: scale(10);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  return button;
}
