export function sumaOrdenada(nums, objetivo) {
  let izq = 0; // apunta al más chico que queda
  let der = nums.length - 1; // apunta al más grande que queda

  while (izq < der) {
    const suma = nums[izq] + nums[der];

    if (suma === objetivo) return [izq, der];

    if (suma < objetivo) {
      izq++; // falta: necesito un número más grande a la izquierda
    } else {
      der--; // sobra: necesito un número más chico a la derecha
    }
  }

  return []; // no debería pasar: el enunciado garantiza una solución
}
