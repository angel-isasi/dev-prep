export function componer(f, g) {
  return (x) => f(g(x));
}
