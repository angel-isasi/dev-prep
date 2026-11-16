import { useEffect, useState } from "react";

export function DetalleProducto({ id }) {
  const [estado, setEstado] = useState({ cargando: true, error: null, producto: null });

  useEffect(() => {
    // Cada ejecución del efecto tiene SU propia bandera (closure).
    let ignorar = false;
    setEstado({ cargando: true, error: null, producto: null });

    fetch(`/api/practica/productos/${id}`)
      .then((respuesta) => {
        if (respuesta.status === 404) throw new Error("Producto no encontrado");
        if (!respuesta.ok) throw new Error("No se pudo cargar el producto");
        return respuesta.json();
      })
      .then((producto) => {
        if (!ignorar) setEstado({ cargando: false, error: null, producto });
      })
      .catch((error) => {
        if (ignorar) return;
        // Un fallo de red trae un mensaje técnico: mostramos el genérico.
        const mensaje = error.message === "Producto no encontrado" ? error.message : "No se pudo cargar el producto";
        setEstado({ cargando: false, error: mensaje, producto: null });
      });

    // Corre cuando `id` cambia (antes del efecto nuevo) y al desmontar:
    // a partir de ahí, la respuesta de ESTE id ya no importa.
    return () => {
      ignorar = true;
    };
  }, [id]);

  if (estado.cargando) return <p role="status">Cargando producto...</p>;
  if (estado.error) return <p role="alert">{estado.error}</p>;

  const { nombre, categoria, precio, stock } = estado.producto;
  return (
    <article>
      <h2>{nombre}</h2>
      <p>Categoría: {categoria}</p>
      <p>Precio: S/ {precio.toFixed(2)}</p>
      <p>{stock === 0 ? "Agotado" : `Stock: ${stock}`}</p>
    </article>
  );
}
