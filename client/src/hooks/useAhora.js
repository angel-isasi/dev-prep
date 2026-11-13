import { useEffect, useState } from "react";

/** La hora actual, actualizada cada `cadaMs` (para textos como "hace 3 s"). */
export function useAhora(cadaMs = 1000) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), cadaMs);
    return () => clearInterval(id);
  }, [cadaMs]);
  return ahora;
}
