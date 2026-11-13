// Con var hay una sola `i` para todo el bucle: cuando corren los
// setTimeout, el bucle ya terminó e `i` vale 3.
export const prediccion = [3, 3, 3];

export function arreglado(n) {
  const salida = [];
  for (let i = 0; i < n; i++) {
    setTimeout(() => salida.push(i), 0);
  }
  return salida;
}
