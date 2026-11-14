// Insertar y devolver el id
//
// crearCliente(db, { nombre, email, ciudad }): valida, guarda el cliente y devuelve su id nuevo.
// Errores (en este orden): "El nombre es obligatorio", "El email no es válido",
//   "La ciudad es obligatoria", "El email ya está registrado".
//
//   crearCliente(db, { nombre: "Rosa Paredes", email: "rosa.paredes@correo.pe", ciudad: "Piura" })  ->  7
//
// Para escribir se usa .run(): db.prepare("INSERT ...").run(valor1, valor2)
//   devuelve { changes, lastInsertRowid }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function crearCliente(db, datos) {
  // Tu código aquí
}
