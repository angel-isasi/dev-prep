export function negar(cumple) {
  return (...args) => !cumple(...args);
}
