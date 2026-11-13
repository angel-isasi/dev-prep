export function crearContador(inicial = 0) {
  let cuenta = inicial;

  return {
    incrementar: () => ++cuenta,
    decrementar: () => --cuenta,
    valor: () => cuenta,
  };
}
