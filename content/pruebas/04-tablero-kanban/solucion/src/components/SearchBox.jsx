// Buscador: un campo controlado. El filtrado lo hace App con matchesQuery().
import { useId } from "react";

/** @param {{ query: string, onQueryChange: (query: string) => void }} props */
export function SearchBox({ query, onQueryChange }) {
  const id = useId();
  return (
    <div className="search">
      <label htmlFor={id}>Buscar tareas</label>
      <input
        id={id}
        type="search"
        value={query}
        placeholder="Buscar por título"
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </div>
  );
}
