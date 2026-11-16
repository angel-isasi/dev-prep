import { useCallback, useEffect, useRef, useState } from "react";

// Caché en memoria, compartida por todos los componentes: url -> datos.
// Vive fuera del hook para que no se pierda al desmontar.
const cache = new Map();

export function limpiarCache() {
  cache.clear();
}

/** Errores en los que vale la pena reintentar: red caída o 5xx (el servidor tuvo un problema). */
function esReintentable(error) {
  return error.status === undefined || error.status >= 500;
}

export function useRecurso(url, { reintentos = 2, esperaBase = 500 } = {}) {
  const [estado, setEstado] = useState(() =>
    cache.has(url)
      ? { datos: cache.get(url), error: null, cargando: false }
      : { datos: null, error: null, cargando: true },
  );
  // `version` sube con cada recargar() para volver a correr el efecto.
  const [version, setVersion] = useState(0);
  // Si es true, la próxima ejecución del efecto ignora la caché.
  const forzar = useRef(false);

  useEffect(() => {
    const ignorarCache = forzar.current;
    forzar.current = false;

    if (!ignorarCache && cache.has(url)) {
      setEstado({ datos: cache.get(url), error: null, cargando: false });
      return;
    }

    let activo = true;
    let temporizador = null;
    setEstado((anterior) => ({ ...anterior, error: null, cargando: true }));

    function intentar(numero) {
      fetch(url)
        .then((respuesta) => {
          if (!respuesta.ok) {
            const error = new Error(`HTTP ${respuesta.status}`);
            error.status = respuesta.status;
            throw error;
          }
          return respuesta.json();
        })
        .then((datos) => {
          if (!activo) return;
          cache.set(url, datos);
          setEstado({ datos, error: null, cargando: false });
        })
        .catch((error) => {
          if (!activo) return;
          if (esReintentable(error) && numero < reintentos) {
            // Espera creciente (backoff exponencial): 500 ms, 1000 ms, 2000 ms...
            temporizador = setTimeout(() => intentar(numero + 1), esperaBase * 2 ** numero);
          } else {
            setEstado({ datos: null, error, cargando: false });
          }
        });
    }

    intentar(0);

    // Si cambia la url, se llama recargar() o se desmonta: ni respuestas viejas
    // ni reintentos programados.
    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, [url, version, reintentos, esperaBase]);

  const recargar = useCallback(() => {
    forzar.current = true;
    setVersion((v) => v + 1);
  }, []);

  return { ...estado, recargar };
}
