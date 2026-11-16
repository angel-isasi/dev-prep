import { FILTERS } from "../filters.js";

export function FilterBar({ filter, onFilterChange, query, onQueryChange }) {
  return (
    <div className="filter-bar">
      <div className="segmented">
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
