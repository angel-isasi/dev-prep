import { useCallback, useEffect, useState } from "react";

export function useTecla(tecla, accion) {
  useEffect(() => {
    function manejar(evento) {
      if (evento.key === tecla) accion(evento);
    }

    document.addEventListener("keydown", manejar);
    return () => document.removeEventListener("keydown", manejar);
  }, [tecla, accion]);
}

export function Ayuda() {
  const [visible, setVisible] = useState(false);

  // Estable entre renders: el efecto de useTecla no se rehace en cada render.
  const alternar = useCallback(() => setVisible((v) => !v), []);
  useTecla("?", alternar);

  return visible ? <p>Atajos de teclado</p> : null;
}
