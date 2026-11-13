import { useEffect, useState } from "react";

export function useDebounce(valor, ms = 300) {
  const [retrasado, setRetrasado] = useState(valor);

  useEffect(() => {
    // Programa la actualización para dentro de `ms`.
    const id = setTimeout(() => setRetrasado(valor), ms);
    // Si `valor` cambia antes, React ejecuta esta limpieza y cancela el temporizador.
    return () => clearTimeout(id);
  }, [valor, ms]);

  return retrasado;
}
