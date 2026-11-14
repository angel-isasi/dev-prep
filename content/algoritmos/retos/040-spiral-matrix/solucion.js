export function espiral(matriz) {
  const resultado = [];
  if (matriz.length === 0) return resultado;

  // Límites de la parte que falta recorrer (todos inclusivos).
  let arriba = 0;
  let abajo = matriz.length - 1;
  let izquierda = 0;
  let derecha = matriz[0].length - 1;

  while (arriba <= abajo && izquierda <= derecha) {
    // 1. Fila de arriba, de izquierda a derecha.
    for (let c = izquierda; c <= derecha; c++) resultado.push(matriz[arriba][c]);
    arriba++;

    // 2. Columna derecha, de arriba a abajo.
    for (let f = arriba; f <= abajo; f++) resultado.push(matriz[f][derecha]);
    derecha--;

    // 3. Fila de abajo, de derecha a izquierda (si todavía queda una fila).
    if (arriba <= abajo) {
      for (let c = derecha; c >= izquierda; c--) resultado.push(matriz[abajo][c]);
      abajo--;
    }

    // 4. Columna izquierda, de abajo hacia arriba (si todavía queda una columna).
    if (izquierda <= derecha) {
      for (let f = abajo; f >= arriba; f--) resultado.push(matriz[f][izquierda]);
      izquierda++;
    }
  }

  return resultado;
}
