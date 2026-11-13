export function esValido(s) {
  // Para cada símbolo de cierre, cuál es su apertura.
  const pares = { ")": "(", "]": "[", "}": "{" };
  const pila = [];

  for (const c of s) {
    if (c in pares) {
      // Es un cierre: lo último que abrí tiene que ser su pareja.
      if (pila.pop() !== pares[c]) return false;
    } else {
      // Es una apertura: la guardo hasta que llegue su cierre.
      pila.push(c);
    }
  }

  // Si sobra algo en la pila, quedó un paréntesis sin cerrar.
  return pila.length === 0;
}
