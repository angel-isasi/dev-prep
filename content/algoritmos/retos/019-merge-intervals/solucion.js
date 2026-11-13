export function fusionar(intervalos) {
  // Ordeno una copia por inicio: los que se superponen quedan juntos.
  const ordenados = [...intervalos].sort((a, b) => a[0] - b[0]);
  const resultado = [];

  for (const [inicio, fin] of ordenados) {
    const ultimo = resultado[resultado.length - 1];

    if (ultimo && inicio <= ultimo[1]) {
      // Se superpone con el último: extiendo su final (si este llega más lejos).
      ultimo[1] = Math.max(ultimo[1], fin);
    } else {
      // No se superpone: empieza un intervalo nuevo (una copia, no el original).
      resultado.push([inicio, fin]);
    }
  }

  return resultado;
}
