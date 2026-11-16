// Brillo que sigue al mouse en las tarjetas con la clase "brillo" (como MagicCard de Magic UI,
// pero para toda la app con UN solo detector). Guarda la posición del mouse en --mx y --my
// de la tarjeta que tienes debajo; el dibujo lo hace el CSS (base.css). Una vez por cuadro como máximo.
import { useEffect } from "react";

export function useBrillo() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let pendiente = null;
    let ultimo = null;
    const mover = (e) => {
      ultimo = e;
      if (pendiente) return;
      pendiente = requestAnimationFrame(() => {
        pendiente = null;
        const tarjeta = ultimo.target.closest?.(".brillo");
        if (!tarjeta) return;
        const r = tarjeta.getBoundingClientRect();
        tarjeta.style.setProperty("--mx", `${ultimo.clientX - r.left}px`);
        tarjeta.style.setProperty("--my", `${ultimo.clientY - r.top}px`);
      });
    };
    document.addEventListener("pointermove", mover, { passive: true });
    return () => {
      document.removeEventListener("pointermove", mover);
      if (pendiente) cancelAnimationFrame(pendiente);
    };
  }, []);
}
