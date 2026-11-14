// Voltea el tramo nums[i..j] en el lugar, intercambiando los extremos.
function invertir(nums, i, j) {
  while (i < j) {
    [nums[i], nums[j]] = [nums[j], nums[i]];
    i++;
    j--;
  }
}

export function rotar(nums, k) {
  const n = nums.length;
  k = k % n; // rotar n veces deja todo igual: solo importa el resto

  invertir(nums, 0, n - 1); // [1,2,3,4,5,6,7] -> [7,6,5,4,3,2,1]
  invertir(nums, 0, k - 1); // primeros k:      -> [5,6,7,4,3,2,1]
  invertir(nums, k, n - 1); // el resto:        -> [5,6,7,1,2,3,4]
}
