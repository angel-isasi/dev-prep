const VALORES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

export function romanoAEntero(s) {
  let total = 0;

  for (let i = 0; i < s.length; i++) {
    const actual = VALORES[s[i]];
    const siguiente = VALORES[s[i + 1]] || 0; // 0 si ya no hay siguiente

    // Si el actual es menor que el que le sigue (como la I de IV), se resta.
    if (actual < siguiente) {
      total -= actual;
    } else {
      total += actual;
    }
  }

  return total;
}
