import { useEffect, useState } from "react";

export function PrecioRemoto({ tamano, obtenerPrecio }) {
  // null significa "todavía no llega el precio".
  const [precio, setPrecio] = useState(null);

  useEffect(() => {
    // Cada ejecución del efecto tiene su propia bandera.
    let vigente = true;
    setPrecio(null);

    obtenerPrecio(tamano).then((nuevoPrecio) => {
      // Si el tamaño ya cambió, esta respuesta es vieja: se ignora.
      if (vigente) setPrecio(nuevoPrecio);
    });

    // Limpieza: corre antes del siguiente efecto (o al desmontar).
    return () => {
      vigente = false;
    };
  }, [tamano, obtenerPrecio]);

  return <p>{precio === null ? "Calculando…" : `S/ ${precio}`}</p>;
}
