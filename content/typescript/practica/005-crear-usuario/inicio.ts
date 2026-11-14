// Crear un usuario
//
// Completa las interfaces y la función:
// - DatosUsuario: nombre, email y telefono (opcional).
// - Usuario: id (de solo lectura), nombre, email, telefono (opcional) y activo.
// - crearUsuario limpia los datos (trim, email en minúsculas) y pone activo: true.
//   Solo incluye telefono si vino y no está vacío.
//
//   crearUsuario(1, { nombre: " Ana ", email: "ANA@correo.pe" })
//     ->  { id: 1, nombre: "Ana", email: "ana@correo.pe", activo: true }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export interface DatosUsuario {
  // Tu código aquí
}

export interface Usuario {
  // Tu código aquí
}

export function crearUsuario(id: number, datos: DatosUsuario): Usuario {
  // Tu código aquí
  return {} as Usuario;
}
