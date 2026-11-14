export function aguaAtrapada(alturas) {
  let izq = 0;
  let der = alturas.length - 1;
  let maxIzq = 0; // pared más alta vista desde la izquierda
  let maxDer = 0; // pared más alta vista desde la derecha
  let agua = 0;

  while (izq < der) {
    if (alturas[izq] < alturas[der]) {
      // A la derecha hay una pared más alta que esta columna, así que
      // el agua sobre `izq` la limita la pared más alta de la izquierda.
      maxIzq = Math.max(maxIzq, alturas[izq]);
      agua += maxIzq - alturas[izq];
      izq++;
    } else {
      // Caso simétrico: el límite lo pone la pared más alta de la derecha.
      maxDer = Math.max(maxDer, alturas[der]);
      agua += maxDer - alturas[der];
      der--;
    }
  }

  return agua;
}
