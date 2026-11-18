// Confeti y sonido suave para celebrar. Respeta "reducir movimiento" del sistema.
// Variantes: "ejercicio" (resolver o repasar), "leccion", "meta" (cumpliste la meta del día) y "logro"
// (insignia o nivel nuevo). Las de lección y logro son más cortas: la idea es acompañar, no distraer.
import confetti from "canvas-confetti";
import { sonidos } from "./sonidos.js";

// Los colores salen del tema (acento, éxito, aviso) para que se vean bien en claro y en oscuro
const colores = () => {
  const estilo = getComputedStyle(document.documentElement);
  return ["--acento", "--exito", "--aviso", "--color-area"].map((v) => estilo.getPropertyValue(v).trim()).filter(Boolean);
};

/** @param {"ejercicio"|"leccion"|"meta"|"logro"} [tipo] */
export function celebrar(tipo = "ejercicio") {
  (tipo === "logro" ? sonidos.logro : tipo === "meta" ? sonidos.meta : sonidos.leccion)();
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const cantidad = tipo === "leccion" ? 40 : tipo === "logro" ? 90 : 70;
  const base = { particleCount: cantidad, spread: 70, startVelocity: 38, ticks: 180, colors: colores(), disableForReducedMotion: true };
  if (tipo === "logro") {
    confetti({ ...base, angle: 90, spread: 100, origin: { x: 0.5, y: 0.8 } });
    return;
  }
  confetti({ ...base, angle: 60, origin: { x: 0.15, y: 0.75 } });
  confetti({ ...base, angle: 120, origin: { x: 0.85, y: 0.75 } });
}
