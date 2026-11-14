export function contarSubarreglos(nums, k) {
  // suma de prefijo -> cuántas veces la vi.
  // El 0 ya "aparece" una vez: es el prefijo vacío, antes del primer elemento.
  const vecesPrefijo = new Map([[0, 1]]);
  let suma = 0;
  let total = 0;

  for (const num of nums) {
    suma += num;

    // Cada prefijo anterior que valía `suma - k` cierra un tramo que suma k.
    total += vecesPrefijo.get(suma - k) || 0;

    // Recién ahora registro la suma actual (para los pasos siguientes).
    vecesPrefijo.set(suma, (vecesPrefijo.get(suma) || 0) + 1);
  }

  return total;
}
