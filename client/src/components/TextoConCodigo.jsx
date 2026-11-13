/** Muestra un texto donde lo que va entre `comillas invertidas` se ve como código. */
export function TextoConCodigo({ children }) {
  return children.split("`").map((parte, i) => (i % 2 === 1 ? <code key={i}>{parte}</code> : parte));
}
