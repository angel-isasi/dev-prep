import { useCallback, useEffect, useState } from "react";

export function Carga({ cargar }) {
  // Un solo estado: es imposible estar "cargando" y "con error" a la vez.
  const [estado, setEstado] = useState({ fase: "cargando" });

  // La misma función sirve para la carga inicial y para el botón.
  const intentar = useCallback(() => {
    setEstado({ fase: "cargando" });
    cargar().then(
      (dato) => setEstado({ fase: "listo", dato }),
      () => setEstado({ fase: "error" })
    );
  }, [cargar]);

  useEffect(() => {
    intentar();
  }, [intentar]);

  if (estado.fase === "cargando") return <p>Cargando…</p>;

  if (estado.fase === "error") {
    return (
      <div>
        <p role="alert">No se pudo cargar el menú</p>
        <button onClick={intentar}>Reintentar</button>
      </div>
    );
  }

  return <p>{estado.dato}</p>;
}
