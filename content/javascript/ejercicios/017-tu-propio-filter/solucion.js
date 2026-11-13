export function filtrar(lista, cumple) {
  const resultado = [];

  for (let i = 0; i < lista.length; i++) {
    if (cumple(lista[i], i, lista)) {
      resultado.push(lista[i]);
    }
  }

  return resultado;
}
