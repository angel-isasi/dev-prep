export function recorridoPorNiveles(raiz) {
  if (!raiz) return [];

  const niveles = [];
  const cola = [raiz]; // nodos por visitar, en orden de llegada

  while (cola.length > 0) {
    // Ahora mismo la cola tiene EXACTAMENTE los nodos de un nivel.
    const tamano = cola.length;
    const nivel = [];

    for (let i = 0; i < tamano; i++) {
      const nodo = cola.shift(); // saco el primero que entró
      nivel.push(nodo.val);

      // Sus hijos son del nivel siguiente: van al final de la cola.
      if (nodo.left) cola.push(nodo.left);
      if (nodo.right) cola.push(nodo.right);
    }

    niveles.push(nivel);
  }

  return niveles;
}
