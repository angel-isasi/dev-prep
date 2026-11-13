// Confeti para celebrar cuando resuelves un ejercicio o terminas un repaso.
// Respeta "reducir movimiento" del sistema.
import confetti from "canvas-confetti";

const COLORES = ["#b3a8ff", "#5fd3a0", "#e7b96c", "#ededf0"];

export function celebrar() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const base = { particleCount: 70, spread: 70, startVelocity: 38, ticks: 180, colors: COLORES, disableForReducedMotion: true };
  confetti({ ...base, angle: 60, origin: { x: 0.15, y: 0.75 } });
  confetti({ ...base, angle: 120, origin: { x: 0.85, y: 0.75 } });
}
