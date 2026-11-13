export function formasDeSubir(n) {
  // formas(i) = formas(i - 1) + formas(i - 2)
  let anteAnterior = 1; // formas de llegar al escalón 0 (quedarse abajo)
  let anterior = 1; // formas de llegar al escalón 1

  for (let i = 2; i <= n; i++) {
    const actual = anterior + anteAnterior;
    anteAnterior = anterior;
    anterior = actual;
  }

  return anterior;
}
