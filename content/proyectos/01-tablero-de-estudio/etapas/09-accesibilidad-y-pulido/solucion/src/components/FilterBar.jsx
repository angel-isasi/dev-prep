import { FILTERS } from "../filters.js";

export function FilterBar({ filter, onFilterChange, query, onQueryChange }) {
  return (
    <div className="filter-bar">
      {/* role="group" con nombre: el lector anuncia "Filtrar por estado" antes de los botones */}
      <div className="segmented" role="group" aria-label="Filtrar por estado">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <input
        type="search"
        aria-label="Buscar tareas"
        placeholder="Buscar por título o tema"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </div>
  );
}
