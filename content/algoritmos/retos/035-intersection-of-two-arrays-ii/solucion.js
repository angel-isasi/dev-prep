export function interseccion(nums1, nums2) {
  // Cuántas copias de cada número hay en nums1.
  const conteo = new Map();
  for (const num of nums1) {
    conteo.set(num, (conteo.get(num) || 0) + 1);
  }

  // Recorro nums2 gastando copias: nunca uso más de las que había.
  const resultado = [];
  for (const num of nums2) {
    if (conteo.get(num) > 0) {
      resultado.push(num);
      conteo.set(num, conteo.get(num) - 1);
    }
  }

  return resultado;
}
