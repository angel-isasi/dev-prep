export function buscarEnRotado(nums, objetivo) {
  let izq = 0;
  let der = nums.length - 1;

  while (izq <= der) {
    const medio = Math.floor((izq + der) / 2);
    if (nums[medio] === objetivo) return medio;

    if (nums[izq] <= nums[medio]) {
      // La mitad izquierda (izq..medio) está ordenada.
      if (nums[izq] <= objetivo && objetivo < nums[medio]) {
        der = medio - 1; // el objetivo cae dentro de esa mitad ordenada
      } else {
        izq = medio + 1; // si está, está en la otra mitad
      }
    } else {
      // Si la izquierda no está ordenada, la mitad derecha (medio..der) sí.
      if (nums[medio] < objetivo && objetivo <= nums[der]) {
        izq = medio + 1; // el objetivo cae dentro de esa mitad ordenada
      } else {
        der = medio - 1;
      }
    }
  }

  return -1;
}
