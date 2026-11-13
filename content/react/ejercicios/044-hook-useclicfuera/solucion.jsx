import { useEffect, useRef, useState } from "react";

export function useClicFuera(ref, alHacerClicFuera) {
  useEffect(() => {
    function manejar(evento) {
      // contains: ¿el elemento clicado está dentro de ref.current (o es él mismo)?
      if (ref.current && !ref.current.contains(evento.target)) {
        alHacerClicFuera();
      }
    }

    document.addEventListener("mousedown", manejar);
    // Limpieza: quita el listener al desmontar (o antes de volver a ponerlo).
    return () => document.removeEventListener("mousedown", manejar);
  }, [ref, alHacerClicFuera]);
}

export function Desplegable() {
  const [abierto, setAbierto] = useState(true);
  const ref = useRef(null);

  useClicFuera(ref, () => setAbierto(false));

  return <div ref={ref}>{abierto ? <p>Opciones</p> : <p>Cerrado</p>}</div>;
}
