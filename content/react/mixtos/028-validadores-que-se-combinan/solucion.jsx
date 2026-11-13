// Cada validador devuelve null si el valor está bien, o un mensaje si está mal.
export const requerido = (valor) => (String(valor).trim() ? null : "Este campo es obligatorio");

// Fábrica: minimo(3) devuelve un validador que "recuerda" el 3 (closure).
export const minimo = (n) => (valor) =>
  String(valor).trim().length >= n ? null : `Escribe al menos ${n} caracteres`;

export const esCorreo = (valor) => (/^\S+@\S+\.\S+$/.test(valor) ? null : "Ingresa un correo válido");

export function validar(valores, reglas) {
  const errores = {};

  for (const [campo, validadores] of Object.entries(reglas)) {
    const valor = valores[campo] ?? "";
    // Corre los validadores en orden y se queda con el primer mensaje (el primero que no es null).
    const mensaje = validadores.map((validador) => validador(valor)).find(Boolean);
    if (mensaje) errores[campo] = mensaje;
  }

  return errores;
}
