import { useState } from "react";

export function Cantidad({ nombre }) {
  // Cada <Cantidad> en pantalla tiene su propio `cantidad`.
  const [cantidad, setCantidad] = useState(0);

  return (
    <button onClick={() => setCantidad(cantidad + 1)}>
      {nombre}: {cantidad}
    </button>
  );
}
