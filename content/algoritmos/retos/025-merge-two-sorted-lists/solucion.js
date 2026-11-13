export function unir(a, b) {
  // Nodo ficticio: la lista resultado cuelga de él, así el primero no es un caso especial.
  const inicio = { val: 0, next: null };
  let cola = inicio; // último nodo de la lista resultado

  while (a && b) {
    // Engancho el menor de los dos y avanzo en esa lista.
    if (a.val <= b.val) {
      cola.next = a;
      a = a.next;
    } else {
      cola.next = b;
      b = b.next;
    }
    cola = cola.next;
  }

  // Una se acabó: lo que queda de la otra ya está ordenado, lo engancho entero.
  cola.next = a || b;

  return inicio.next;
}
