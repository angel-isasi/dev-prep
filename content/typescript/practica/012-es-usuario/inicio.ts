// ¿Es un usuario?
//
// esUsuario(dato): true si `dato` es un objeto con id (number), nombre (string)
// y email (string). Su tipo de retorno debe ser un type guard: `dato is Usuario`.
// nombresDeUsuarios(datos): los nombres de los elementos que son usuarios.
//
//   esUsuario({ id: 1, nombre: "Ana", email: "ana@correo.com" })  ->  true
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

// Cambia `boolean` por el type guard correcto.
export function esUsuario(dato: unknown): boolean {
  // Tu código aquí
  return false;
}

export function nombresDeUsuarios(datos: unknown[]): string[] {
  // Tu código aquí
  return [];
}
