import { useMemo, useState } from "react";

// Contador para medir cuántas veces corre el cálculo.
export let calculos = 0;

export function estadisticas(pedidos) {
  calculos++;
  return {
    total: pedidos.reduce((suma, pedido) => suma + pedido.monto, 0),
    mayor: Math.max(...pedidos.map((pedido) => pedido.monto)),
  };
}

export function Reporte({ pedidos }) {
  const [clics, setClics] = useState(0);

  // Solo se recalcula si `pedidos` es otro arreglo. Los clics reutilizan el resultado.
  const datos = useMemo(() => estadisticas(pedidos), [pedidos]);

  return (
    <div>
      <p>
        Total {datos.total}, mayor {datos.mayor}
      </p>
      <button onClick={() => setClics(clics + 1)}>Clics: {clics}</button>
    </div>
  );
}
