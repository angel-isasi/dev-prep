import { useEffect, useState } from "react";

const ESPERA_MS = 400;

export function BuscadorProductos() {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState({ tipo: "inicial", productos: [], consulta: "", error: null });

  useEffect(() => {
    const consulta = texto.trim();
    if (!consulta) {
      setEstado({ tipo: "inicial", productos: [], consulta: "", error: null });
      return;
    }

    setEstado((anterior) => ({ ...anterior, tipo: "buscando" }));
    const control = new AbortController();

    // Debounce: solo pedimos si pasan 400 ms sin que el texto cambie.
    const temporizador = setTimeout(() => {
      const url = `/api/practica/productos?q=${encodeURIComponent(consulta)}`;
      fetch(url, { signal: control.signal })
        .then((respuesta) => {
          if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
          return respuesta.json();
        })
        .then((cuerpo) => setEstado({ tipo: "listo", productos: cuerpo.datos, consulta, error: null }))
        .catch((error) => {
          // La abortamos nosotros porque llegó una búsqueda más nueva.
          if (error.name === "AbortError") return;
          setEstado({ tipo: "error", productos: [], consulta, error: error.message });
        });
    }, ESPERA_MS);

    // Si el texto cambia antes de los 400 ms, se cancela el temporizador.
    // Si la petición ya salió, se aborta: su respuesta nunca llegará.
    return () => {
      clearTimeout(temporizador);
      control.abort();
    };
  }, [texto]);

  return (
    <div>
      <input
        type="search"
        aria-label="Buscar productos"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
      />

      {estado.tipo === "buscando" && <p role="status">Buscando...</p>}
      {estado.tipo === "error" && <p role="alert">No se pudo buscar: {estado.error}</p>}
      {estado.tipo === "listo" && estado.productos.length === 0 && (
        <p>No hay resultados para "{estado.consulta}"</p>
      )}
      {estado.tipo === "listo" && estado.productos.length > 0 && (
        <ul aria-label="Resultados">
          {estado.productos.map((producto) => (
            <li key={producto.id}>{producto.nombre}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
