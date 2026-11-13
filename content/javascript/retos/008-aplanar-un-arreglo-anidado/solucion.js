export function aplanar(arr) {
  return arr.reduce(
    (acumulado, elemento) =>
      Array.isArray(elemento) ? acumulado.concat(aplanar(elemento)) : acumulado.concat([elemento]),
    [],
  );
}
