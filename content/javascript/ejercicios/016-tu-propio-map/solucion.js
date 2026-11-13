export function mapear(lista, fn) {
  const resultado = [];

  for (let i = 0; i < lista.length; i++) {
    resultado.push(fn(lista[i], i, lista));
  }

  return resultado;
}
