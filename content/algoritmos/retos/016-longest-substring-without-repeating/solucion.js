export function sinRepetidos(s) {
  const ultimaPos = new Map(); // carácter -> último índice donde lo vi
  let inicio = 0; // inicio de la ventana actual (sin repetidos)
  let mejor = 0;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    // Si `c` ya está DENTRO de la ventana, la ventana empieza justo después.
    if (ultimaPos.has(c) && ultimaPos.get(c) >= inicio) {
      inicio = ultimaPos.get(c) + 1;
    }

    ultimaPos.set(c, i);
    mejor = Math.max(mejor, i - inicio + 1);
  }

  return mejor;
}
