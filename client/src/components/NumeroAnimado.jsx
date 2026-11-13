import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

/**
 * Un número que "sube" desde su valor anterior hasta el nuevo.
 * @param {{ valor: number, decimales?: number, duracion?: number }} props
 */
export function NumeroAnimado({ valor, decimales = 0, duracion = 0.8 }) {
  const ref = useRef(null);
  const anterior = useRef(0);
  const reducido = useReducedMotion();

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    const pintar = (v) => {
      nodo.textContent = v.toFixed(decimales);
    };
    if (reducido) {
      pintar(valor);
      anterior.current = valor;
      return;
    }
    const control = animate(anterior.current, valor, { duration: duracion, ease: [0.2, 0.8, 0.2, 1], onUpdate: pintar });
    anterior.current = valor;
    return () => control.stop();
  }, [valor, decimales, duracion, reducido]);

  return <span ref={ref}>{(0).toFixed(decimales)}</span>;
}
