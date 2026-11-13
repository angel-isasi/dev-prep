import { useEffect, useRef } from "react";

export function Buscador() {
  // `campo.current` será el <input> real del DOM después del primer render.
  const campo = useRef(null);

  useEffect(() => {
    campo.current.focus();
  }, []); // [] = solo al montar

  return <input ref={campo} type="search" aria-label="Buscar pizza" />;
}
