// Validadores que se combinan
//
// Un validador recibe un valor y devuelve null (está bien) o un mensaje de error.
// validar(valores, reglas) aplica los validadores de cada campo y devuelve
// solo los campos con error, con el primer mensaje que encontró.
//
//   const reglas = { nombre: [requerido, minimo(3)], correo: [requerido, esCorreo] };
//   validar({ nombre: "Al", correo: "" }, reglas);
//   // { nombre: "Escribe al menos 3 caracteres", correo: "Este campo es obligatorio" }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function requerido(valor) {
  // Tu código aquí
}

export function minimo(n) {
  // Tu código aquí: devuelve una función (valor) => null o mensaje
}

export function esCorreo(valor) {
  // Tu código aquí
}

export function validar(valores, reglas) {
  // Tu código aquí
}
