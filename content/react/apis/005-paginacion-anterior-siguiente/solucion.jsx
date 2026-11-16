import { useEffect, useState } from "react";

const LIMITE = 10;

export function ProductosPaginados() {
  // La página que el usuario PIDE. Es un objeto a propósito: cada clic crea uno
  // nuevo, así el efecto corre aunque se repita el número (por ejemplo, al
  // volver a intentar después de un error).
  const [pedido, setPedido] = useState({ pagina: 1 });
  // Lo que llegó del servidor: { datos, pagina, totalPaginas, total }.
  const [respuesta, setRespuesta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignorar = false;
    setCargando(true);
    setError(null);

    fetch(`/api/practica/productos?pagina=${pedido.pagina}&limite=${LIMITE}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((cuerpo) => {
        if (ignorar) return;
        setRespuesta(cuerpo);
        setCargando(false);
      })
      .catch((e) => {
        if (ignorar) return;
        setError(e.message);
        setCargando(false);
      });

    return () => {
      ignorar = true;
    };
  }, [pedido]);

  // Primera carga: todavía no hay nada que mostrar.
  if (!respuesta && cargando) return <p role="status">Cargando productos...</p>;
  if (!respuesta && error) return <p role="alert">No se pudieron cargar los productos: {error}</p>;
  if (respuesta.total === 0) return <p>No hay productos</p>;

  // Los números salen de la respuesta del servidor, no de lo que pedimos.
  const esPrimera = respuesta.pagina <= 1;
  const esUltima = respuesta.pagina >= respuesta.totalPaginas;

  return (
    <section>
      <ul aria-label="Productos">
        {respuesta.datos.map((producto) => (
          <li key={producto.id}>{producto.nombre}</li>
        ))}
      </ul>

      {/* Al cambiar de página dejamos la lista anterior a la vista y avisamos. */}
      {cargando && <p role="status">Cargando página...</p>}
      {error && <p role="alert">No se pudo cambiar de página: {error}</p>}

      <nav aria-label="Paginación">
        <button type="button" onClick={() => setPedido({ pagina: respuesta.pagina - 1 })} disabled={cargando || esPrimera}>
          Anterior
        </button>
        <span>
          Página {respuesta.pagina} de {respuesta.totalPaginas}
        </span>
        <button type="button" onClick={() => setPedido({ pagina: respuesta.pagina + 1 })} disabled={cargando || esUltima}>
          Siguiente
        </button>
      </nav>
    </section>
  );
}
