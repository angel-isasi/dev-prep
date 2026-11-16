// ¿La web está conectada al dev-prep de esta laptop? Revisa al abrir, al volver a la pestaña
// y cada 20 segundos (así detecta cuando abres o cierras dev-prep).
import { useEffect, useState } from "react";
import { alCambiar, conectada, esMiLaptop, probar } from "../lib/conexion-local.js";

const CADA_MS = 20_000;

export function useConexionLocal(activo = true) {
  const [estado, setEstado] = useState(conectada);

  useEffect(() => {
    if (!activo) return;
    const quitar = alCambiar(setEstado);
    const revisar = () => esMiLaptop() && document.visibilityState === "visible" && probar();
    revisar();
    const intervalo = setInterval(revisar, CADA_MS);
    document.addEventListener("visibilitychange", revisar);
    return () => {
      quitar();
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", revisar);
    };
  }, [activo]);

  return activo && estado;
}
