// Lógica pura del catálogo: sin React, fácil de probar y de reutilizar.

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
];

/** 24.9 -> "S/ 24.90" */
export function formatPrice(price) {
  return `S/ ${price.toFixed(2)}`;
}

/** "  Café " -> "cafe": sin tildes, en minúsculas y sin espacios en los extremos. */
export function normalize(text) {
  return text
    .normalize("NFD") // "é" pasa a ser "e" + tilde combinable
    .replace(/[̀-ͯ]/g, "") // quita las tildes combinables
    .toLowerCase()
    .trim();
}

/** Categorías únicas, en orden alfabético. */
export function getCategories(products) {
  const unique = new Set(products.map((product) => product.category));
  return [...unique].sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Filtra por texto (en el nombre) y por categoría ("" significa todas).
 * @param {Array} products
 * @param {{ query: string, category: string }} filters
 */
export function filterProducts(products, { query, category }) {
  const needle = normalize(query);
  return products.filter(
    (product) =>
      (category === "" || product.category === category) &&
      normalize(product.name).includes(needle),
  );
}

const COMPARATORS = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

/**
 * Ordena según SORT_OPTIONS. Devuelve un arreglo NUEVO: no modifica el original.
 * @param {Array} products
 * @param {"relevance" | "price-asc" | "price-desc"} sort
 */
export function sortProducts(products, sort) {
  const compare = COMPARATORS[sort];
  // "relevance" no tiene comparador: se respeta el orden de la API.
  return compare ? products.toSorted(compare) : products;
}
