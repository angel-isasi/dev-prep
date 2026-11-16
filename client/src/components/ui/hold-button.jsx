// HoldButton (Kokonut UI, kokonutui.com/docs/buttons/hold-button), adaptado:
// mantén presionado para confirmar. El relleno sigue cuánto mantienes; si sueltas antes, se vacía.
// Sirve para acciones que no se deshacen (como "Empezar de cero"): no se activa con un clic por error.
//   <HoldButton alCompletar={borrar} peligro>Mantén presionado para borrar</HoldButton>
// Cambios: JavaScript, sin cva ni lucide, colores de tokens.css, teclado (mantener Espacio o Enter)
// y sin animación de relleno con "reducir movimiento" (basta con mantener).
import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import estilos from "./hold-button.module.css";

/**
 * @param {{ children: React.ReactNode, alCompletar: () => void | Promise<void>, duracion?: number, peligro?: boolean, textoListo?: string, disabled?: boolean }} props
 */
export function HoldButton({ children, alCompletar, duracion = 1600, peligro = false, textoListo = "Listo", disabled = false }) {
  const progreso = useMotionValue(0);
  const ancho = useTransform(progreso, (v) => `${v * 100}%`);
  const control = useRef(null);
  const [completo, setCompleto] = useState(false);
  const reducido = useReducedMotion();

  useEffect(() => () => control.current?.stop(), []);

  function empezar() {
    if (disabled || completo) return;
    control.current?.stop();
    const restante = (1 - progreso.get()) * duracion;
    control.current = animate(progreso, 1, {
      duration: restante / 1000,
      ease: "linear",
      onComplete: async () => {
        setCompleto(true);
        await alCompletar?.();
      },
    });
  }

  function soltar() {
    if (completo) return;
    control.current?.stop();
    // Se vacía más rápido de lo que se llenó (como en el original)
    control.current = animate(progreso, 0, { duration: reducido ? 0 : (progreso.get() * duracion) / 3000, ease: "easeOut" });
  }

  return (
    <button
      type="button"
      className={estilos.boton}
      data-peligro={peligro}
      data-completo={completo}
      disabled={disabled}
      onPointerDown={empezar}
      onPointerUp={soltar}
      onPointerLeave={soltar}
      onPointerCancel={soltar}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && (e.preventDefault(), empezar())}
      onKeyUp={(e) => (e.key === " " || e.key === "Enter") && soltar()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.span className={estilos.relleno} style={{ width: ancho }} aria-hidden />
      <span className={estilos.texto}>{completo ? `✓ ${textoListo}` : children}</span>
    </button>
  );
}
