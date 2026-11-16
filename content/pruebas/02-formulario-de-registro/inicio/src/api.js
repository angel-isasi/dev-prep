// API falsa de Wayra Pagos. NO necesitas modificar este archivo.

const DELAY_MS = 800;
const TAKEN_EMAILS = ["usado@wayra.pe"];

/**
 * Registra un usuario.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ id: string, email: string }>}
 */
export function registerUser({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        reject(new Error("Faltan datos para crear la cuenta."));
      } else if (TAKEN_EMAILS.includes(email.toLowerCase())) {
        reject(new Error("Este correo ya está registrado. Inicia sesión o usa otro correo."));
      } else {
        resolve({ id: `usr_${Date.now()}`, email });
      }
    }, DELAY_MS);
  });
}
