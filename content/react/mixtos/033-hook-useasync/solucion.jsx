import { useCallback, useState } from "react";

export function useAsync(fn) {
  // Un solo objeto: fase, dato y error siempre cambian juntos.
  const [estado, setEstado] = useState({ fase: "inicial", dato: null, error: null });

  // useCallback: ejecutar es la misma función mientras fn no cambie.
  const ejecutar = useCallback(
    async (...args) => {
      setEstado({ fase: "cargando", dato: null, error: null });
      try {
        const dato = await fn(...args);
        setEstado({ fase: "listo", dato, error: null });
        return dato;
      } catch (error) {
        setEstado({ fase: "error", dato: null, error });
      }
    },
    [fn],
  );

  return { ...estado, ejecutar };
}
