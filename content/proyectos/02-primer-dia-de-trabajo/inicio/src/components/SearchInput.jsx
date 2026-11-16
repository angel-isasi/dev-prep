// Campo de búsqueda del design system de MesaYa. Úsalo en vez de un <input> suelto,
// así todos los buscadores se ven y se comportan igual (con su botón para limpiar).
export function SearchInput({ label, value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="search">
      <input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
      {value && (
        <button type="button" className="search__clear" aria-label="Limpiar búsqueda" onClick={() => onChange("")}>
          ×
        </button>
      )}
    </div>
  );
}
