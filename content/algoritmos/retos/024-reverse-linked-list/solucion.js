export function invertir(cabeza) {
  let anterior = null; // la parte ya invertida empieza vacía
  let actual = cabeza;

  while (actual) {
    const siguiente = actual.next; // 1. guardo el resto para no perderlo
    actual.next = anterior; // 2. volteo la flecha
    anterior = actual; // 3. avanzo los dos punteros
    actual = siguiente;
  }

  // Cuando `actual` llega a null, `anterior` es el último nodo: la nueva cabeza.
  return anterior;
}
