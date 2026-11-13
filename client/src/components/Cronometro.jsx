import { useEffect, useRef } from "react";
import { useAhora } from "../hooks/useAhora.js";
import estilos from "./Cronometro.module.css";

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Cuenta regresiva. Se pone en ámbar al quedar 5 minutos y en rojo al terminar.
 * @param {{ inicio: number, segundos: number, alTerminar?: () => void }} props  inicio = Date.now() al empezar
 */
export function Cronometro({ inicio, segundos, alTerminar }) {
  const ahora = useAhora(500);
  const restante = Math.max(0, segundos - (ahora - inicio) / 1000);
  const avisado = useRef(false);

  useEffect(() => {
    if (restante === 0 && !avisado.current) {
      avisado.current = true;
      alTerminar?.();
    }
  }, [restante, alTerminar]);

  const estado = restante === 0 ? "fin" : restante <= 300 ? "poco" : "ok";
  return (
    <span className={estilos.cronometro} data-estado={estado} role="timer" aria-label={`Quedan ${mmss(restante)}`}>
      {restante === 0 ? "Tiempo" : mmss(restante)}
    </span>
  );
}

export { mmss };
