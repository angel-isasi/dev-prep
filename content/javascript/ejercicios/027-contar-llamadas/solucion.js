export function contarLlamadas(fn) {
  const envuelta = (...args) => {
    envuelta.veces++;
    return fn(...args);
  };

  envuelta.veces = 0;
  return envuelta;
}
