export function parcial(fn, ...fijos) {
  return (...resto) => fn(...fijos, ...resto);
}
