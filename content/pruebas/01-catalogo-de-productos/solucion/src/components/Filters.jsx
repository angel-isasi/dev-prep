// Controles del catálogo: búsqueda, categoría y orden. Componente controlado:
// no guarda estado propio, recibe los valores y avisa los cambios.
import { useId } from "react";
import { SORT_OPTIONS } from "../lib/catalog.js";

/**
 * @param {{
 *   query: string, category: string, sort: string, categories: string[],
 *   onQueryChange: (value: string) => void,
 *   onCategoryChange: (value: string) => void,
 *   onSortChange: (value: string) => void,
 * }} props
 */
export function Filters({ query, category, sort, categories, onQueryChange, onCategoryChange, onSortChange }) {
  // useId genera ids únicos para unir cada <label> con su control (htmlFor + id).
  const id = useId();

  return (
    <div className="filters">
      <div className="field field--grow">
        <label htmlFor={`${id}-query`}>Buscar productos</label>
        <input
          id={`${id}-query`}
          type="search"
          value={query}
          placeholder="Ej.: arroz, leche, café"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={`${id}-category`}>Categoría</label>
        <select id={`${id}-category`} value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">Todas</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`${id}-sort`}>Ordenar por</label>
        <select id={`${id}-sort`} value={sort} onChange={(event) => onSortChange(event.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
