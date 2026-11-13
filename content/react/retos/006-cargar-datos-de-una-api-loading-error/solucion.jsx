import { useEffect, useState } from "react";

export function Noticias() {
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: [] });

  useEffect(() => {
    const control = new AbortController();

    fetch("/api/noticias", { signal: control.signal })
      .then((respuesta) => {
        // fetch NO falla con 404 o 500: hay que revisar `ok` a mano.
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        return respuesta.json();
      })
      .then((datos) => setEstado({ cargando: false, error: null, datos }))
      .catch((error) => {
        // Si abortamos al desmontar, no es un error real.
        if (error.name === "AbortError") return;
        setEstado({ cargando: false, error: error.message, datos: [] });
      });

    // Limpieza: si el componente se desmonta antes de la respuesta, cancela la petición.
    return () => control.abort();
  }, []);

  if (estado.cargando) return <p>Cargando...</p>;
  if (estado.error) return <p role="alert">No se pudo cargar: {estado.error}</p>;
  if (estado.datos.length === 0) return <p>No hay noticias</p>;

  return (
    <ul>
      {estado.datos.map((noticia) => (
        <li key={noticia.id}>{noticia.titulo}</li>
      ))}
    </ul>
  );
}
