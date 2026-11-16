// Campo de texto reutilizable: etiqueta, input, ayuda opcional y mensaje de error accesible.

/**
 * @param {{
 *   label: string,
 *   name: string,
 *   type?: string,
 *   value: string,
 *   error?: string,     mensaje a mostrar ("" o undefined si no hay error)
 *   hint?: string,      ayuda siempre visible debajo del campo
 *   onChange: (event) => void,
 *   onBlur: (event) => void,
 *   autoComplete?: string,
 * }} props
 */
export function TextField(props) {
  // TODO: un <label> unido al <input> con htmlFor e id (usa useId para ids únicos).
  // TODO: si hay hint, muéstralo en un elemento con su propio id.
  // TODO: si hay error, muéstralo en un elemento con su propio id y pon en el input:
  //       aria-invalid="true" y aria-describedby con los ids de la ayuda y del error.
  return <input aria-label={props.label} />;
}
