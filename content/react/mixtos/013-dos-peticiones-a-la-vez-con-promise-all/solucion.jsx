import { useEffect, useState } from "react";

export function Panel({ obtenerMenu, obtenerPromos }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true; // pasa a false si el componente se desmonta

    // Las dos peticiones arrancan aquí, al mismo tiempo.
    Promise.all([obtenerMenu(), obtenerPromos()])
      .then(([menu, promos]) => {
        if (vigente) setDatos({ menu, promos });
      })
      .catch(() => {
        if (vigente) setError(true);
      });

    return () => {
      vigente = false;
    };
  }, [obtenerMenu, obtenerPromos]);

  if (error) return <p role="alert">No se pudo cargar el panel</p>;
  if (!datos) return <p>Cargando…</p>;
  return (
    <p>
      {datos.menu.length} pizzas y {datos.promos.length} promos
    </p>
  );
}
