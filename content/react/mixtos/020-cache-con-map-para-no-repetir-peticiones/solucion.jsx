import { useEffect, useState } from "react";

// Vive fuera del componente: se comparte entre renders y entre componentes.
const cache = new Map();

export function obtenerConCache(clave, cargar) {
  if (!cache.has(clave)) {
    // Se guarda la PROMESA: pedidos simultáneos comparten la misma petición.
    cache.set(clave, cargar(clave));
  }
  return cache.get(clave);
}

export function Detalle({ id, cargar }) {
  const [dato, setDato] = useState(null);

  useEffect(() => {
    let vigente = true;
    setDato(null); // vuelve a "Cargando…" al cambiar de id

    obtenerConCache(id, cargar).then((resultado) => {
      if (vigente) setDato(resultado);
    });

    return () => {
      vigente = false;
    };
  }, [id, cargar]);

  return <p>{dato ?? "Cargando…"}</p>;
}
