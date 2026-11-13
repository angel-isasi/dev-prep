export function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}
