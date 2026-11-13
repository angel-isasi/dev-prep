// Normalizar por id
//
// porId(lista): [{ id: "p1", ... }] -> { p1: { id: "p1", ... } }
// DetallePedido({ pedido, pizzas }): un <li> con el nombre de cada id del pedido,
// o "Pizza no disponible" si el id no existe.
//
//   <DetallePedido pedido={["p2", "p9"]} pizzas={[{ id: "p2", nombre: "Pepperoni" }]} />
//   -> Pepperoni, Pizza no disponible
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useMemo } from "react";

export function porId(lista) {
  // Tu código aquí
  return {};
}

export function DetallePedido({ pedido, pizzas }) {
  // Tu código aquí
  return null;
}
