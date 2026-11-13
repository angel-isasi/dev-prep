export function once(fn) {
  let hecho = false;
  let resultado;

  return function (...args) {
    if (!hecho) {
      hecho = true;
      resultado = fn.apply(this, args);
    }
    return resultado;
  };
}
