export function ponerCeros(matriz) {
  const filasConCero = new Set();
  const columnasConCero = new Set();

  // 1ª pasada: solo anoto dónde hay ceros. No cambio nada todavía,
  // para que los ceros que ponga después no se confundan con los originales.
  for (let f = 0; f < matriz.length; f++) {
    for (let c = 0; c < matriz[f].length; c++) {
      if (matriz[f][c] === 0) {
        filasConCero.add(f);
        columnasConCero.add(c);
      }
    }
  }

  // 2ª pasada: una celda queda en 0 si su fila o su columna estaban marcadas.
  for (let f = 0; f < matriz.length; f++) {
    for (let c = 0; c < matriz[f].length; c++) {
      if (filasConCero.has(f) || columnasConCero.has(c)) {
        matriz[f][c] = 0;
      }
    }
  }

  return matriz; // la misma matriz, modificada
}
