// Utilidades de texto para búsquedas.

/** "  José " -> "jose": minúsculas, sin tildes y sin espacios en los extremos. */
export function normalize(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** true si `value` contiene `query`, sin importar tildes ni mayúsculas. Funciona con números. */
export function matchesQuery(value, query) {
  return normalize(value).includes(normalize(query));
}
