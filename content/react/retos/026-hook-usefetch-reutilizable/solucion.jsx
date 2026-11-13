import { useEffect, useState } from "react";

export function useFetch(url) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true });

  useEffect(() => {
    // `activo` pasa a false cuando la url cambia o el componente se desmonta.
    let activo = true;
    setEstado((anterior) => ({ ...anterior, cargando: true, error: null }));

    fetch(url)
      .then((respuesta) => {
        // fetch NO falla con 404 o 500: hay que revisar `ok` a mano.
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return respuesta.json();
      })
      .then((datos) => {
        if (activo) setEstado({ datos, error: null, cargando: false });
      })
      .catch((error) => {
        if (activo) setEstado({ datos: null, error, cargando: false });
      });

    return () => {
      activo = false;
    };
  }, [url]);

  return estado;
}
