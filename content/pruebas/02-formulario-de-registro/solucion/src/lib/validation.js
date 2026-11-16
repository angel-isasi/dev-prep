// Reglas de validación del registro: funciones puras que devuelven el mensaje de error
// o "" si el valor es válido.

export const PASSWORD_HINT = "Mínimo 8 caracteres, con al menos una mayúscula y un número.";

// Algo@algo.algo, sin espacios. Suficiente para el frontend: el backend confirma con el correo de verificación.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  const value = email.trim();
  if (value === "") return "Ingresa tu correo electrónico.";
  if (!EMAIL_PATTERN.test(value)) return "Ingresa un correo válido, por ejemplo nombre@dominio.com.";
  return "";
}

// Reglas en orden: se muestra la primera que no se cumple.
const PASSWORD_RULES = [
  { test: (value) => value.length > 0, message: "Ingresa una contraseña." },
  { test: (value) => value.length >= 8, message: "La contraseña debe tener al menos 8 caracteres." },
  { test: (value) => /[A-ZÁÉÍÓÚÑ]/.test(value), message: "La contraseña debe tener al menos una letra mayúscula." },
  { test: (value) => /\d/.test(value), message: "La contraseña debe tener al menos un número." },
];

export function validatePassword(password) {
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  return failed ? failed.message : "";
}

export function validateConfirm(password, confirm) {
  if (confirm === "") return "Confirma tu contraseña.";
  if (confirm !== password) return "Las contraseñas no coinciden.";
  return "";
}

/**
 * Valida todo el formulario.
 * @param {{ email: string, password: string, confirm: string }} values
 * @returns {{ email: string, password: string, confirm: string }} un mensaje por campo ("" si está bien)
 */
export function validate(values) {
  return {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirm: validateConfirm(values.password, values.confirm),
  };
}
