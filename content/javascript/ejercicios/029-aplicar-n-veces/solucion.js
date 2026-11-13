export function aplicarVeces(fn, veces, valor) {
  let resultado = valor;

  for (let i = 0; i < veces; i++) {
    resultado = fn(resultado);
  }

  return resultado;
}
