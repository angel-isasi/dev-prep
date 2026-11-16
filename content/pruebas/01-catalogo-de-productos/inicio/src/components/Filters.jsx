// Controles del catálogo: búsqueda, categoría y orden. Componente controlado:
// no guarda estado propio, recibe los valores y avisa los cambios.
import { SORT_OPTIONS } from "../lib/catalog.js";

/**
 * @param {{
 *   query: string, category: string, sort: string, categories: string[],
 *   onQueryChange: (value: string) => void,
 *   onCategoryChange: (value: string) => void,
 *   onSortChange: (value: string) => void,
 * }} props
 */
export function Filters(props) {
  // TODO: un <input type="search"> con la etiqueta "Buscar productos".
  // TODO: un <select> con la etiqueta "Categoría": "Todas" (valor "") y luego cada categoría.
  // TODO: un <select> con la etiqueta "Ordenar por" con las opciones de SORT_OPTIONS.
  // Une cada <label> con su control usando htmlFor e id (useId te da ids únicos).
  void props;
  void SORT_OPTIONS;
  return null;
}
