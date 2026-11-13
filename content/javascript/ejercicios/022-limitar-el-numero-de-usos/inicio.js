// Limitar el número de usos
//
// Devuelve una función que ejecuta fn como máximo `max` veces.
// Después devuelve el último resultado sin volver a llamar a fn.
//
//   const votar = limitar(() => ++votos, 1);
//   votar(); votar(); votar();   // votos queda en 1
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function limitar(fn, max) {
  // Tu código aquí
}
