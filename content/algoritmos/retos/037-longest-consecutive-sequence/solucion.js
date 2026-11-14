export function secuenciaMasLarga(nums) {
  const numeros = new Set(nums); // búsqueda O(1) y sin repetidos
  let mejor = 0;

  for (const x of numeros) {
    // Solo cuento desde el INICIO de una secuencia (si no hay x - 1).
    if (!numeros.has(x - 1)) {
      let actual = x;
      let largo = 1;

      while (numeros.has(actual + 1)) {
        actual++;
        largo++;
      }

      mejor = Math.max(mejor, largo);
    }
  }

  return mejor;
}
