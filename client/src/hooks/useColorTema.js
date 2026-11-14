import { useEffect, useState } from "react";

const temaActual = () => document.documentElement.dataset.tema ?? "oscuro";

/** Avisa cada vez que cambia el atributo data-tema de <html> (modo claro u oscuro). */
function alCambiarTema(avisar) {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  return () => observador.disconnect();
}

/**
 * Lee el valor actual de una variable CSS de tokens.css (por ejemplo "--acento")
 * y se actualiza solo cuando cambias entre modo claro y oscuro.
 * Sirve para componentes que dibujan en <canvas> o WebGL, que no entienden var(--acento).
 */
export function useColorTema(variable) {
  const leer = () => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  const [color, setColor] = useState(leer);

  useEffect(
    () => alCambiarTema(() => setColor(leer())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variable],
  );

  return color;
}

/**
 * Elige un valor según el tema: porTema({ oscuro: "#1c1a26", claro: "#dcd8e8" }).
 * Para colores que no existen como variable en tokens.css.
 */
export function usePorTema(valores) {
  const [tema, setTema] = useState(temaActual);
  useEffect(() => alCambiarTema(() => setTema(temaActual())), []);
  return valores[tema] ?? valores.oscuro;
}
