export function memoize(fn) {
  const cache = new Map();

  return function (...args) {
    const clave = JSON.stringify(args);
    if (cache.has(clave)) return cache.get(clave);

    const resultado = fn.apply(this, args);
    cache.set(clave, resultado);
    return resultado;
  };
}
