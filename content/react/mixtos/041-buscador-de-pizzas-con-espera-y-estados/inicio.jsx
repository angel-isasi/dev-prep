// Buscador de pizzas con espera y estados
//
// Busca 300 ms después de la última tecla y muestra una fase a la vez:
// inicial, cargando, resultados, vacío o error. Ignora respuestas viejas.
//
//   <BuscadorPizzas buscar={async (texto) => ["Margarita", "Marinera"]} />
//
//   (vacío)    ->  "Escribe el nombre de una pizza."
//   cargando   ->  "Buscando…"
//   sin nada   ->  "No hay pizzas con “sushi”."
//   error      ->  role="alert": "No pudimos buscar. Revisa tu conexión."
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function BuscadorPizzas({ buscar }) {
  // Tu código aquí
  return null;
}
