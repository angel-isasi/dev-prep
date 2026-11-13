export function maxAgua(alturas) {
  let i = 0; // línea izquierda
  let j = alturas.length - 1; // línea derecha
  let mejor = 0;

  while (i < j) {
    const area = Math.min(alturas[i], alturas[j]) * (j - i);
    mejor = Math.max(mejor, area);

    // Muevo la línea más baja: es la que limita el agua.
    if (alturas[i] < alturas[j]) {
      i++;
    } else {
      j--;
    }
  }

  return mejor;
}
