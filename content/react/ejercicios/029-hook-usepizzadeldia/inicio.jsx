// Hook usePizzaDelDia
//
// El hook llama a `obtener()` (una función asíncrona) al montar y devuelve
// null mientras espera y luego el objeto { nombre }. Si `obtener` cambia
// antes de que llegue la respuesta, ignora la respuesta vieja.
// El componente muestra "Cargando la pizza del día…" o "Hoy: <nombre>".
//
//   <PizzaDelDia obtener={async () => ({ nombre: "Cuatro quesos" })} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function usePizzaDelDia(obtener) {
  // Tu código aquí
}

export function PizzaDelDia({ obtener }) {
  // Tu código aquí
  return null;
}
