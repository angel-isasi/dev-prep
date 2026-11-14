export function esArbolDeBusqueda(raiz) {
  // ¿Todos los valores de este subárbol están estrictamente entre min y max?
  function valido(nodo, min, max) {
    if (!nodo) return true; // un subárbol vacío no rompe nada

    if (nodo.val <= min || nodo.val >= max) return false; // fuera de su rango

    // Hacia la izquierda, el techo pasa a ser este nodo.
    // Hacia la derecha, el piso pasa a ser este nodo.
    return valido(nodo.left, min, nodo.val) && valido(nodo.right, nodo.val, max);
  }

  // La raíz puede tener cualquier valor.
  return valido(raiz, -Infinity, Infinity);
}
