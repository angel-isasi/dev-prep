export function pick(obj, claves) {
  return Object.fromEntries(claves.filter((clave) => clave in obj).map((clave) => [clave, obj[clave]]));
}

export function omit(obj, claves) {
  return Object.fromEntries(Object.entries(obj).filter(([clave]) => !claves.includes(clave)));
}
