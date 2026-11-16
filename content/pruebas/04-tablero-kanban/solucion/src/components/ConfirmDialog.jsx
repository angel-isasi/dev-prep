// Diálogo de confirmación propio: no sabe nada de tareas, se puede reutilizar para cualquier "¿seguro?".
// Por qué no window.confirm: no se puede estilar, bloquea toda la página y no deja explicar bien qué pasa.
import { useEffect, useId, useRef } from "react";

/**
 * @param {{
 *   title: string,
 *   message: string,
 *   confirmLabel: string,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  // Al abrir, el foco va a la opción segura: un Enter apurado no borra nada
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCancel();
      return;
    }
    if (event.key !== "Tab") return;

    // Foco atrapado: de la última opción se vuelve a la primera y al revés
    const focusables = dialogRef.current.querySelectorAll("button:not([disabled])");
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="dialog-backdrop"
      // Clic en el fondo oscuro (no dentro del diálogo) = cancelar
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId}>{title}</h2>
        <p id={messageId}>{message}</p>
        <div className="dialog__actions">
          <button ref={cancelRef} type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
