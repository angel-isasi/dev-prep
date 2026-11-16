import { useEffect, useState } from "react";

const URL_PRODUCTOS = "/api/practica/productos";

export function ListaProductos() {
  // Un solo objeto para el estado: así nunca hay "cargando" y "error" a la vez.
  const [estado, setEstado] = useState({ cargando: true, error: null, respuesta: null });

  useEffect(() => {
    const control = new AbortController();

    async function cargar() {
      let respuesta;
      try {
        respuesta = await fetch(URL_PRODUCTOS, { signal: control.signal });
      } catch (error) {
        // fetch solo se rechaza si no hubo respuesta: sin red, servidor apagado o abortado.
        if (error.name === "AbortError") return;
        setEstado({ cargando: false, error: "revisa tu conexión", respuesta: null });
        return;
      }

      if (!respuesta.ok) {
        // Un 404 o un 500 SÍ es una respuesta: hay que revisar `ok` a mano.
        // El cuerpo puede traer el mensaje del servidor, o no ser JSON.
        const cuerpo = await respuesta.json().catch(() => null);
        const mensaje = cuerpo?.error ?? `Error ${respuesta.status}`;
        setEstado({ cargando: false, error: mensaje, respuesta: null });
        return;
      }

      const cuerpo = await respuesta.json();
      setEstado({ cargando: false, error: null, respuesta: cuerpo });
    }

    cargar();
    // Si el componente se desmonta antes de la respuesta, cancela la petición.
    return () => control.abort();
  }, []);

  if (estado.cargando) return <p role="status">Cargando productos...</p>;
  if (estado.error) return <p role="alert">No se pudieron cargar los productos: {estado.error}</p>;

  const { datos, total } = estado.respuesta;
  if (datos.length === 0) return <p>No hay productos</p>;

  return (
    <section>
      <ul aria-label="Productos">
        {datos.map((producto) => (
          <li key={producto.id}>
            {producto.nombre}: S/ {producto.precio.toFixed(2)}
          </li>
        ))}
      </ul>
      <p>
        Mostrando {datos.length} de {total} productos
      </p>
    </section>
  );
}
