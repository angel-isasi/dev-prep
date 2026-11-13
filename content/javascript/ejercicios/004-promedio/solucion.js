export function promedio(nums) {
  if (nums.length === 0) return 0;

  const suma = nums.reduce((total, n) => total + n, 0);
  return suma / nums.length;
}
