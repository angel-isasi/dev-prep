export function mapAsync(lista, fn) {
  return Promise.all(lista.map(fn));
}
