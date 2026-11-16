// Mejores puntajes
//
// Devuelve los `n` puntajes más altos, de mayor a menor,
// sin modificar el arreglo original.
//
//   mejoresPuntajes([80, 100, 9, 45], 3)  ->  [100, 80, 45]

export function mejoresPuntajes(puntajes, n) {
  return [...puntajes].sort().reverse().slice(0, n);
}
