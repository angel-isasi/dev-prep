export function trianguloPascal(numFilas) {
  const triangulo = [];

  for (let i = 0; i < numFilas; i++) {
    const fila = [1]; // toda fila empieza en 1
    const anterior = triangulo[i - 1]; // en la primera fila es undefined, pero no se usa

    // Números del medio: cada uno es la suma de los dos que tiene encima.
    for (let j = 1; j < i; j++) {
      fila.push(anterior[j - 1] + anterior[j]);
    }

    if (i > 0) fila.push(1); // toda fila, menos la primera, termina en 1
    triangulo.push(fila);
  }

  return triangulo;
}
