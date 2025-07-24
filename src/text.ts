import type { TAlignment } from "./types";

export function renderTextAligned(
  x: number,
  y: number,
  text: string,
  alignment: TAlignment,
  ctx: CanvasRenderingContext2D
) {
  ctx.font = "50px monospace";
  ctx.textAlign = alignment;
  ctx.fillStyle = "red";
  ctx.fillText(text, x, y);
}
