import { useState } from "react";

// Desestructuramos las opciones con valores por defecto.
// El "= {}" final permite llamar useContador() sin argumentos.
export function useContador({ inicial = 0, min = -Infinity, max = Infinity } = {}) {
  const [cuenta, setCuenta] = useState(inicial);

  // Forma funcional: cada llamada parte del valor más reciente.
  const sumar = () => setCuenta((c) => Math.min(max, c + 1));
  const restar = () => setCuenta((c) => Math.max(min, c - 1));
  const reiniciar = () => setCuenta(inicial);

  return { cuenta, sumar, restar, reiniciar };
}
