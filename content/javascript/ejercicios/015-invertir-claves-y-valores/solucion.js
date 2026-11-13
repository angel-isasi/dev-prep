export function invertirObjeto(obj) {
  const pares = Object.entries(obj);
  const invertidos = pares.map(([clave, valor]) => [valor, clave]);
  return Object.fromEntries(invertidos);
}
