import estilos from "./BotonAzar.module.css";

/** Botón "Uno al azar" con un dado que gira al pasar el mouse (mismo que en Inicio). */
export function BotonAzar({ onClick, children = "Uno al azar", disabled }) {
  return (
    <button type="button" className={estilos.azar} onClick={onClick} disabled={disabled}>
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
        <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </svg>
      {children}
    </button>
  );
}
