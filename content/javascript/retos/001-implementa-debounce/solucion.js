export function debounce(fn, ms) {
  let temporizador;

  return function (...args) {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn.apply(this, args), ms);
  };
}
