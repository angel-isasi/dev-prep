// Consultar cada cierto tiempo hasta terminar
//
// Empieza en "preparando". Cada `cada` ms llama a consultar() y muestra
// <p>Tu pedido está: {estado}</p>. Al llegar a "entregado", deja de consultar.
//
//   <EstadoPedido consultar={() => fetch("/api/pedido/7").then((r) => r.json()).then((d) => d.estado)} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function EstadoPedido({ consultar, cada = 1000 }) {
  // Tu código aquí
  return null;
}
