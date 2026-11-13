export function productoExceptoYo(nums) {
  const resultado = new Array(nums.length).fill(1);

  // Pasada 1, de izquierda a derecha: resultado[i] = producto de todo lo que está a su IZQUIERDA.
  let izquierda = 1;
  for (let i = 0; i < nums.length; i++) {
    resultado[i] = izquierda;
    izquierda *= nums[i];
  }

  // Pasada 2, de derecha a izquierda: multiplico por todo lo que está a su DERECHA.
  let derecha = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    resultado[i] *= derecha;
    derecha *= nums[i];
  }

  return resultado;
}
