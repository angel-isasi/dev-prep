// Tomo las props que este componente maneja y junto todas las demás en `resto`.
export function Boton({ variante = "primario", className = "", children, ...resto }) {
  // trim() quita el espacio sobrante cuando no hay className extra.
  const clases = `boton boton-${variante} ${className}`.trim();

  return (
    <button className={clases} {...resto}>
      {children}
    </button>
  );
}
