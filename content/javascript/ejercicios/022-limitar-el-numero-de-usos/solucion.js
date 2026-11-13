export function limitar(fn, max) {
  let usos = 0;
  let ultimo;

  return (...args) => {
    if (usos < max) {
      usos++;
      ultimo = fn(...args);
    }
    return ultimo;
  };
}
