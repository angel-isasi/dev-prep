import estilos from "./Buscador.module.css";

/** Campo de búsqueda con lupa, igual en todas las pantallas. Si recibe onSubmit va dentro de un form. */
export function Buscador({ valor, alCambiar, onSubmit, placeholder, etiqueta, autoFocus, ancho }) {
  const campo = (
    <label className={estilos.buscador} style={ancho ? { width: ancho } : undefined}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        aria-label={etiqueta ?? placeholder}
        placeholder={placeholder}
        value={valor}
        autoFocus={autoFocus}
        onChange={(e) => alCambiar(e.target.value)}
      />
    </label>
  );
  return onSubmit ? <form onSubmit={onSubmit}>{campo}</form> : campo;
}
