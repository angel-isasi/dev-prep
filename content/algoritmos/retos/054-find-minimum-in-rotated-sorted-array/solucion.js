export function minimoRotado(nums) {
  let izq = 0;
  let der = nums.length - 1;

  // Invariante: el mínimo siempre está entre izq y der (incluidos).
  while (izq < der) {
    const medio = Math.floor((izq + der) / 2);

    if (nums[medio] > nums[der]) {
      // De medio a der hay una "bajada": el mínimo está a la derecha de medio.
      izq = medio + 1;
    } else {
      // De medio a der todo sube: el mínimo es medio o está a su izquierda.
      der = medio;
    }
  }

  // Cuando izq === der, quedó un solo candidato: el mínimo.
  return nums[izq];
}
