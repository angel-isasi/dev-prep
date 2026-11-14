export function ordenarColores(nums) {
  // Zonas del arreglo:
  //   [0, bajo)        -> todos 0
  //   [bajo, medio)    -> todos 1
  //   [medio, alto]    -> sin revisar todavía
  //   (alto, final]    -> todos 2
  let bajo = 0;
  let medio = 0;
  let alto = nums.length - 1;

  while (medio <= alto) {
    if (nums[medio] === 0) {
      // Lo mando a la zona de los 0. Lo que llega desde `bajo` es un 1 ya revisado.
      [nums[bajo], nums[medio]] = [nums[medio], nums[bajo]];
      bajo++;
      medio++;
    } else if (nums[medio] === 1) {
      // Ya está en su zona: solo avanzo.
      medio++;
    } else {
      // Es un 2: lo mando al final. Lo que llega desde `alto` no lo he revisado,
      // por eso NO avanzo `medio`.
      [nums[medio], nums[alto]] = [nums[alto], nums[medio]];
      alto--;
    }
  }

  return nums;
}
