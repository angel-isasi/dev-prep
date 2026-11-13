export function despuesDe(veces, fn) {
  let llamadas = 0;

  return (...args) => {
    llamadas++;
    if (llamadas >= veces) {
      return fn(...args);
    }
    return undefined;
  };
}
