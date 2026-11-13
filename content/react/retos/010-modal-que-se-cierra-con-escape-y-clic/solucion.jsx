import { useEffect } from "react";

export function Modal({ abierto, titulo, onCerrar, children }) {
  useEffect(() => {
    if (!abierto) return; // cerrado: no escuchamos nada

    function alPresionarTecla(evento) {
      if (evento.key === "Escape") onCerrar();
    }

    document.addEventListener("keydown", alPresionarTecla);
    // Limpieza: quita el listener al cerrar el modal o al desmontarlo.
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      data-testid="fondo"
      onClick={onCerrar}
      style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(evento) => evento.stopPropagation()}
        style={{ background: "white", margin: "15vh auto", padding: 16, maxWidth: 400 }}
      >
        <h2>{titulo}</h2>
        {children}
        <button onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  );
}
