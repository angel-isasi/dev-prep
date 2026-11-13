export function maxSubarreglo(nums) {
  let actual = nums[0]; // mejor suma de un tramo que TERMINA en la posición actual
  let mejor = nums[0]; // mejor suma vista en todo el recorrido

  for (let i = 1; i < nums.length; i++) {
    // ¿Sigo el tramo que traigo o empiezo uno nuevo aquí?
    actual = Math.max(nums[i], actual + nums[i]);
    mejor = Math.max(mejor, actual);
  }

  return mejor;
}
