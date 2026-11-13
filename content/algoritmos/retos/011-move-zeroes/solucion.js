export function moverCeros(nums) {
  let escribir = 0; // dónde va el próximo número distinto de cero

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      // Intercambio: el no-cero va adelante y el cero (si lo había) va a su lugar.
      [nums[escribir], nums[i]] = [nums[i], nums[escribir]];
      escribir++;
    }
  }

  return nums;
}
