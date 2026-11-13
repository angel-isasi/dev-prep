export function contarIslas(grilla) {
  if (grilla.length === 0) return 0;

  const filas = grilla.length;
  const columnas = grilla[0].length;
  const g = grilla.map((fila) => [...fila]); // copia para no modificar la entrada
  let islas = 0;

  // Convierte en agua la celda (f, c) y toda la tierra conectada a ella.
  function hundir(f, c) {
    if (f < 0 || c < 0 || f >= filas || c >= columnas) return; // fuera de la grilla
    if (g[f][c] !== "1") return; // agua o ya hundida
    g[f][c] = "0";
    hundir(f + 1, c);
    hundir(f - 1, c);
    hundir(f, c + 1);
    hundir(f, c - 1);
  }

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (g[f][c] === "1") {
        islas++; // tierra nueva: es una isla que no había contado
        hundir(f, c); // la borro entera para no volver a contarla
      }
    }
  }

  return islas;
}
