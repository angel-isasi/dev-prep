export function invertirArbol(nodo) {
  // Caso base: un árbol vacío ya es su propio espejo.
  if (!nodo) return null;

  // Invierto cada subárbol y los asigno cruzados, en una sola instrucción.
  [nodo.left, nodo.right] = [invertirArbol(nodo.right), invertirArbol(nodo.left)];

  return nodo;
}
