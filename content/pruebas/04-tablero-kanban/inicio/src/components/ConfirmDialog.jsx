// Diálogo de confirmación propio (nada de window.confirm). No sabe nada de tareas: es reutilizable.

/**
 * @param {{
 *   title: string,
 *   message: string,
 *   confirmLabel: string,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
export function ConfirmDialog(props) {
  // TODO: un fondo (clic en él = cancelar) y dentro:
  //       <div role="dialog" aria-modal="true" aria-labelledby={idDelTitulo} aria-describedby={idDelMensaje}>
  //         <h2>{title}</h2> <p>{message}</p>
  //         <button>Cancelar</button> <button>{confirmLabel}</button>
  // TODO: al montar, el foco va a Cancelar (useRef + useEffect).
  // TODO: onKeyDown: Escape cancela; Tab y Shift+Tab dan la vuelta dentro del diálogo.
  void props;
  return null;
}
