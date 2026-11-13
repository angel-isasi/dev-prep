export function interseccion(a, b) {
  const enB = new Set(b);
  const aSinRepetir = [...new Set(a)];
  return aSinRepetir.filter((x) => enB.has(x));
}
