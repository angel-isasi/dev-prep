// Lógica pura del catálogo: sin React, fácil de probar y de reutilizar.

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
];

/** 24.9 -> "S/ 24.90" */
export function formatPrice(price) {
  // TODO
  return String(price);
}

/** "  Café " -> "cafe": sin tildes, en minúsculas y sin espacios en los extremos. */
export function normalize(text) {
  // TODO: pista: text.normalize("NFD") separa la tilde de la letra.
  return text;
}

/** Categorías únicas, en orden alfabético. */
export function getCategories(products) {
  // TODO
  return [];
}

/**
 * Filtra por texto (en el nombre) y por categoría ("" significa todas).
 * @param {Array} products
 * @param {{ query: string, category: string }} filters
 */
export function filterProducts(products, { query, category }) {
  // TODO
  return products;
}

/**
 * Ordena según SORT_OPTIONS. Devuelve un arreglo NUEVO: no modifiques el original.
 * @param {Array} products
 * @param {"relevance" | "price-asc" | "price-desc"} sort
 */
export function sortProducts(products, sort) {
  // TODO
  return products;
}
