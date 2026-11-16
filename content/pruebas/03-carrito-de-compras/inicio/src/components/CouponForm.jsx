// Campo para aplicar un cupón, o el cupón aplicado con su botón para quitarlo.

/**
 * @param {{
 *   couponCode: string | null,
 *   missingForCoupon: number,                 céntimos que faltan para que el cupón aplique
 *   onApply: (code: string) => string,        devuelve el mensaje de error o ""
 *   onRemove: () => void,
 * }} props
 */
export function CouponForm(props) {
  // TODO: un <form> con el campo "Cupón de descuento" y el botón "Aplicar".
  //       Si onApply devuelve un error, muéstralo con role="alert". Si no, limpia el campo.
  // TODO: si hay cupón: "Cupón CAFE10 aplicado" y el botón "Quitar cupón".
  // TODO: si missingForCoupon > 0: "Agrega S/ 36.00 más para usar BIENVENIDA20."
  void props;
  return null;
}
