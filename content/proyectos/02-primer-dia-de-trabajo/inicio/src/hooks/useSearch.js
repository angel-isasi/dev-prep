import { useState } from "react";
import { matchesQuery } from "../utils/text.js";

/**
 * Búsqueda de texto sobre una lista. Lo armé para la carta, pero sirve para cualquier lista.
 *
 *   const { query, setQuery, results } = useSearch(dishes, ["name", "category"]);
 *
 * `results` son los items en los que alguno de los `fields` contiene la búsqueda
 * (sin importar tildes ni mayúsculas). Con la búsqueda vacía devuelve todos.
 *   - Kevin
 */
export function useSearch(items, fields) {
  const [query, setQuery] = useState("");
  const results = query.trim() === "" ? items : items.filter((item) => fields.some((field) => matchesQuery(item[field], query)));
  return { query, setQuery, results };
}
