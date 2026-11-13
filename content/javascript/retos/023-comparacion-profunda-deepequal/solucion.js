export function iguales(a, b) {
  if (a === b) return true;

  const sonObjetos = typeof a === "object" && typeof b === "object" && a !== null && b !== null;
  if (!sonObjetos) return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const clavesA = Object.keys(a);
  const clavesB = Object.keys(b);
  if (clavesA.length !== clavesB.length) return false;

  return clavesA.every((clave) => clave in b && iguales(a[clave], b[clave]));
}
