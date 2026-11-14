export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

// Partial<Usuario> es Usuario con TODAS sus propiedades opcionales:
// { id?: number; nombre?: string; email?: string; activo?: boolean }
export function actualizarUsuario(usuario: Usuario, cambios: Partial<Usuario>): Usuario {
  // El spread crea un objeto nuevo. El orden importa: lo que va después gana.
  // 1. copia el usuario, 2. encima los cambios, 3. encima el id original.
  return { ...usuario, ...cambios, id: usuario.id };
}
