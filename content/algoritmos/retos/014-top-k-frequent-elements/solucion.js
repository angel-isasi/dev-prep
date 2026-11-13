export function topK(nums, k) {
  // 1. Contar cuántas veces aparece cada número.
  const conteo = new Map();
  for (const n of nums) {
    conteo.set(n, (conteo.get(n) || 0) + 1);
  }

  // 2. Cubetas: en cubetas[f] van los números que aparecen f veces.
  //    Una frecuencia va de 1 a nums.length, por eso hay nums.length + 1 cubetas.
  const cubetas = Array.from({ length: nums.length + 1 }, () => []);
  for (const [numero, frecuencia] of conteo) {
    cubetas[frecuencia].push(numero);
  }

  // 3. Recorrer desde la frecuencia más alta hasta juntar k números.
  const resultado = [];
  for (let f = cubetas.length - 1; f >= 0 && resultado.length < k; f--) {
    resultado.push(...cubetas[f]);
  }

  return resultado.slice(0, k);
}
