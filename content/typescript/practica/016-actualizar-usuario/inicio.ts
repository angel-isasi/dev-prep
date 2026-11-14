// Actualizar un usuario
//
// actualizarUsuario(usuario, cambios): devuelve un usuario NUEVO con los cambios
// aplicados. `cambios` tiene algunas propiedades de Usuario (Partial<Usuario>).
// El id nunca cambia y el original no se modifica.
//
//   actualizarUsuario(ana, { nombre: "Ana María" })  ->  { ...ana, nombre: "Ana María" }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

// Reemplaza `any` por el utility type correcto.
export function actualizarUsuario(usuario: Usuario, cambios: any): Usuario {
  // Tu código aquí
  return usuario;
}
