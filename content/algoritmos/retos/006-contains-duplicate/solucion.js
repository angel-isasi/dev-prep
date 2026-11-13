export function tieneDuplicados(nums) {
  // Un Set no guarda repetidos: si queda más chico que el arreglo, sobraba algo.
  return new Set(nums).size !== nums.length;
}
