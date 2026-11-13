// Dos peticiones a la vez con Promise.all
//
// Pide el menú y las promos AL MISMO TIEMPO. Mientras: "Cargando…".
// Al llegar: "3 pizzas y 1 promos". Si alguna falla:
// <p role="alert">No se pudo cargar el panel</p>
//
//   <Panel obtenerMenu={async () => ["a", "b", "c"]} obtenerPromos={async () => ["2x1"]} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function Panel({ obtenerMenu, obtenerPromos }) {
  // Tu código aquí
  return null;
}
