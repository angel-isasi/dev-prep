export function throttle(fn, ms) {
  let ultimaVez = 0;

  return function (...args) {
    const ahora = Date.now();
    if (ahora - ultimaVez >= ms) {
      ultimaVez = ahora;
      fn.apply(this, args);
    }
  };
}
