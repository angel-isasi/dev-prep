// Reglas de validación del registro: funciones puras que devuelven el mensaje de error
// o "" si el valor es válido. Los textos exactos están en el enunciado.

export const PASSWORD_HINT = "Mínimo 8 caracteres, con al menos una mayúscula y un número.";

export function validateEmail(email) {
  // TODO: vacío -> "Ingresa tu correo electrónico."
  //       sin formato válido -> "Ingresa un correo válido, por ejemplo nombre@dominio.com."
  //       Recuerda: el correo se valida sin espacios al inicio ni al final.
  return "";
}

export function validatePassword(password) {
  // TODO: vacía, menos de 8 caracteres, sin mayúscula, sin número (en ese orden).
  return "";
}

export function validateConfirm(password, confirm) {
  // TODO: vacía -> "Confirma tu contraseña." / distinta -> "Las contraseñas no coinciden."
  return "";
}

/**
 * Valida todo el formulario.
 * @param {{ email: string, password: string, confirm: string }} values
 * @returns {{ email: string, password: string, confirm: string }} un mensaje por campo ("" si está bien)
 */
export function validate(values) {
  // TODO
  return { email: "", password: "", confirm: "" };
}
