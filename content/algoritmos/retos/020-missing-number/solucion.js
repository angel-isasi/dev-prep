export function faltante(nums) {
  const n = nums.length;

  // Suma de 0 + 1 + ... + n (fórmula de Gauss).
  const esperado = (n * (n + 1)) / 2;

  // Suma de lo que de verdad hay en el arreglo.
  const real = nums.reduce((acumulado, x) => acumulado + x, 0);

  // La diferencia es justo el número que falta.
  return esperado - real;
}
