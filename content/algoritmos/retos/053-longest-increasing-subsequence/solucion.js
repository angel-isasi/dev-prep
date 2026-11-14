export function subsecuenciaCreciente(nums) {
  if (nums.length === 0) return 0;

  // terminaEn[i] = largo de la subsecuencia creciente más larga que TERMINA en nums[i].
  // Como mínimo es 1: el número solo.
  const terminaEn = new Array(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    // ¿Detrás de qué número anterior puedo poner nums[i]?
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        terminaEn[i] = Math.max(terminaEn[i], terminaEn[j] + 1);
      }
    }
  }

  // La mejor puede terminar en cualquier posición, no necesariamente en la última.
  return Math.max(...terminaEn);
}
