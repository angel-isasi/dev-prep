import { useEffect } from "react";

// Modal que se cierra con Escape
//
// Mientras el modal está en pantalla, la tecla Escape llama a onCerrar.
// Cuando el modal se desmonta, Escape ya no debe hacer nada.

export function Modal({ titulo, onCerrar, children }) {
  useEffect(() => {
    function alPresionar(e) {
      if (e.key === "Escape") onCerrar();
    }
    window.addEventListener("keydown", alPresionar); // la misma función al agregar...
    return () => window.removeEventListener("keydown", alPresionar); // ...y al quitar
  }, [onCerrar]);

  return (
    <div role="dialog" aria-label={titulo}>
      <h2>{titulo}</h2>
      {children}
      <button onClick={onCerrar}>Cerrar</button>
    </div>
  );
}
