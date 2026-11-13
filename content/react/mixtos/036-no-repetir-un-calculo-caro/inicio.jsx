// No repetir un cálculo caro
//
// `estadisticas` ya está escrita y cuenta cuántas veces se ejecuta en `calculos`.
// Crea `Reporte` para que muestre "Total X, mayor Y" y un botón "Clics: N",
// sin volver a ejecutar `estadisticas` cuando solo cambian los clics.
//
//   <Reporte pedidos={[{ monto: 30 }, { monto: 55 }]} />  ->  "Total 85, mayor 55"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useMemo, useState } from "react";

// No cambies esta parte: los tests la usan para medir.
export let calculos = 0;

export function estadisticas(pedidos) {
  calculos++;
  return {
    total: pedidos.reduce((suma, pedido) => suma + pedido.monto, 0),
    mayor: Math.max(...pedidos.map((pedido) => pedido.monto)),
  };
}

export function Reporte({ pedidos }) {
  // Tu código aquí
  return null;
}
