export function twoSum(nums, objetivo) {
  const vistos = new Map(); // valor -> índice donde lo vi

  for (let i = 0; i < nums.length; i++) {
    const falta = objetivo - nums[i];
    if (vistos.has(falta)) {
      return [vistos.get(falta), i];
    }
    vistos.set(nums[i], i);
  }

  return [];
}
