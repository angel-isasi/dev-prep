// Datos públicos del usuario
//
// UsuarioPublico: Usuario sin password (usa Omit).
// ResumenUsuario: solo id y nombre (usa Pick).
// datosPublicos(usuario): objeto nuevo sin password.
// resumen(usuario): objeto nuevo solo con id y nombre.
//
//   resumen(ana)  ->  { id: 1, nombre: "Ana" }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: "admin" | "cliente";
}

// Reemplaza `any` usando Omit y Pick.
export type UsuarioPublico = any;
export type ResumenUsuario = any;

export function datosPublicos(usuario: Usuario): UsuarioPublico {
  // Tu código aquí
  return usuario;
}

export function resumen(usuario: Usuario): ResumenUsuario {
  // Tu código aquí
  return usuario;
}
