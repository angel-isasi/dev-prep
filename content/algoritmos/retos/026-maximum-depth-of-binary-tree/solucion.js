export function profundidad(nodo) {
  // Caso base: un árbol vacío no tiene niveles.
  if (!nodo) return 0;

  // Este nodo cuenta 1, más el hijo que tenga la rama más larga.
  return 1 + Math.max(profundidad(nodo.left), profundidad(nodo.right));
}
