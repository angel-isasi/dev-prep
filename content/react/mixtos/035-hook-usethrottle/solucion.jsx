import { useEffect, useRef, useState } from "react";

export function useThrottle(valor, ms) {
  const [limitado, setLimitado] = useState(valor);
  // Momento (en ms) de la última actualización. Es un ref: cambiarlo no provoca renders.
  const ultimo = useRef(0);

  useEffect(() => {
    const aplicar = () => {
      ultimo.current = Date.now();
      setLimitado(valor);
    };

    // ¿Cuánto falta para que se cumplan `ms` desde la última actualización?
    const falta = ms - (Date.now() - ultimo.current);

    if (falta <= 0) {
      aplicar();
      return;
    }

    const id = setTimeout(aplicar, falta);
    return () => clearTimeout(id);
  }, [valor, ms]);

  return limitado;
}
