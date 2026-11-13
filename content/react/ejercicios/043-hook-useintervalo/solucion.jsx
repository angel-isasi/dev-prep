import { useEffect, useRef } from "react";

export function useIntervalo(callback, ms) {
  // Una "caja" que sobrevive entre renders y que podemos cambiar sin re-renderizar.
  const ultimoCallback = useRef(callback);

  // Después de cada render, guardamos el callback más reciente.
  useEffect(() => {
    ultimoCallback.current = callback;
  });

  // El intervalo solo depende de `ms`: cambiar el callback no lo reinicia.
  useEffect(() => {
    if (ms === null) return; // pausado

    const id = setInterval(() => ultimoCallback.current(), ms);
    return () => clearInterval(id); // limpia al cambiar ms o al desmontar
  }, [ms]);
}
