export function tresSuma(nums) {
  // Ordeno una copia: así los repetidos quedan juntos y puedo usar dos punteros.
  const a = [...nums].sort((x, y) => x - y);
  const resultado = [];

  for (let i = 0; i < a.length - 2; i++) {
    // Si este número fijo es igual al anterior, ya probé todos sus tríos.
    if (i > 0 && a[i] === a[i - 1]) continue;

    let izq = i + 1;
    let der = a.length - 1;

    while (izq < der) {
      const suma = a[i] + a[izq] + a[der];

      if (suma === 0) {
        resultado.push([a[i], a[izq], a[der]]);
        // Salto los valores repetidos para no generar el mismo trío otra vez.
        while (izq < der && a[izq] === a[izq + 1]) izq++;
        while (izq < der && a[der] === a[der - 1]) der--;
        izq++;
        der--;
      } else if (suma < 0) {
        izq++; // necesito una suma más grande
      } else {
        der--; // necesito una suma más chica
      }
    }
  }

  return resultado;
}
