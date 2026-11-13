export function busquedaBinaria(nums, objetivo) {
  let izq = 0;
  let der = nums.length - 1;

  // Mientras quede al menos un elemento en el rango [izq, der]
  while (izq <= der) {
    const medio = Math.floor((izq + der) / 2);

    if (nums[medio] === objetivo) return medio;

    if (nums[medio] < objetivo) {
      izq = medio + 1; // el objetivo está a la derecha
    } else {
      der = medio - 1; // el objetivo está a la izquierda
    }
  }

  return -1;
}
