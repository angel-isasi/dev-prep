import { useEffect, useState } from "react";

/**
 * Lee el valor actual de una variable CSS de tokens.css (por ejemplo "--acento")
 * y se actualiza solo cuando cambias entre modo claro y oscuro.
 * Sirve para componentes que dibujan en <canvas>, que no entienden var(--acento).
 */
export function useColorTema(variable) {
  const leer = () => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  const [color, setColor] = useState(leer);

  useEffect(() => {
    const observador = new MutationObserver(() => setColor(leer()));
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
    return () => observador.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variable]);

  return color;
}
