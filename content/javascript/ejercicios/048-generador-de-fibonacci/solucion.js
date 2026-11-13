export function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

export function tomar(iterable, cantidad) {
  const resultado = [];
  if (cantidad <= 0) return resultado;

  for (const valor of iterable) {
    resultado.push(valor);
    if (resultado.length === cantidad) break;
  }
  return resultado;
}
