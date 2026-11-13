import { useCallback, useState } from "react";

export function useAlternar(inicial = false) {
  const [valor, setValor] = useState(inicial);

  // useCallback con [] crea la función una sola vez.
  // Usa la forma funcional (v) => !v para no depender de `valor`.
  const alternar = useCallback(() => setValor((v) => !v), []);

  return [valor, alternar];
}
