import { useEffect, useState } from "react";

const GRANDE = "(min-width: 900px)";

/** ¿Pantalla grande (laptop)? Cambia en vivo si giras el celular o achicas la ventana. */
export function usePantallaGrande() {
  const [grande, setGrande] = useState(() => window.matchMedia(GRANDE).matches);
  useEffect(() => {
    const consulta = window.matchMedia(GRANDE);
    const alCambiar = () => setGrande(consulta.matches);
    consulta.addEventListener("change", alCambiar);
    return () => consulta.removeEventListener("change", alCambiar);
  }, []);
  return grande;
}
