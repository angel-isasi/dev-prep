// Busca el PRIMER índice cuyo valor sea mayor o igual al objetivo.
export function posicionInsertar(nums, objetivo) {
  let izq = 0;
  let der = nums.length; // rango [izq, der): `der` puede ser "después del último"

  while (izq < der) {
    const medio = Math.floor((izq + der) / 2);

    if (nums[medio] < objetivo) {
      izq = medio + 1; // medio y todo lo de su izquierda son menores: no sirven
    } else {
      der = medio; // medio podría ser la respuesta: lo conservo
    }
  }

  // izq y der se juntaron en la respuesta.
  return izq;
}
