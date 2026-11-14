export function existePalabra(tablero, palabra) {
  const filas = tablero.length;
  const columnas = tablero[0].length;
  const t = tablero.map((fila) => [...fila]); // copia para no modificar la entrada

  // ¿Puedo formar palabra[k..] empezando en la celda (f, c)?
  function buscar(f, c, k) {
    if (k === palabra.length) return true; // ya coloqué todas las letras
    if (f < 0 || c < 0 || f >= filas || c >= columnas) return false; // fuera del tablero
    if (t[f][c] !== palabra[k]) return false; // letra equivocada (o celda en uso)

    // Elijo esta celda: la marco para no volver a usarla en este camino.
    const letra = t[f][c];
    t[f][c] = "#";

    const encontrada =
      buscar(f + 1, c, k + 1) ||
      buscar(f - 1, c, k + 1) ||
      buscar(f, c + 1, k + 1) ||
      buscar(f, c - 1, k + 1);

    // Deshago la elección: otros caminos pueden necesitar esta celda.
    t[f][c] = letra;
    return encontrada;
  }

  // La palabra puede empezar en cualquier celda.
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (buscar(f, c, 0)) return true;
    }
  }
  return false;
}
