export function clonar(valor) {
  if (valor === null || typeof valor !== "object") return valor;
  if (valor instanceof Date) return new Date(valor);
  if (Array.isArray(valor)) return valor.map(clonar);

  const copia = {};
  for (const [clave, interno] of Object.entries(valor)) {
    copia[clave] = clonar(interno);
  }
  return copia;
}
