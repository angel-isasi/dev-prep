import { useEffect, useState } from "react";

export function useAnchoVentana() {
  // Inicialización perezosa: la función solo se ejecuta en el primer render.
  const [ancho, setAncho] = useState(() => window.innerWidth);

  useEffect(() => {
    function actualizar() {
      setAncho(window.innerWidth);
    }

    window.addEventListener("resize", actualizar);

    // Limpieza: React la llama al desmontar. Quita el MISMO listener.
    return () => window.removeEventListener("resize", actualizar);
  }, []); // [] = suscribirse una sola vez, al montar

  return ancho;
}
