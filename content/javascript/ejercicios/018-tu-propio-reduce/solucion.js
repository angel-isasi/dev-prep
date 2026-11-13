export function reducir(lista, fn, inicial) {
  let acumulado = inicial;

  for (let i = 0; i < lista.length; i++) {
    acumulado = fn(acumulado, lista[i], i);
  }

  return acumulado;
}
