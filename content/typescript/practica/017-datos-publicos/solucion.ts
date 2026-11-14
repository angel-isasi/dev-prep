export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: "admin" | "cliente";
}

// Omit<T, claves>: T sin esas propiedades.
export type UsuarioPublico = Omit<Usuario, "password">;

// Pick<T, claves>: T solo con esas propiedades.
export type ResumenUsuario = Pick<Usuario, "id" | "nombre">;

export function datosPublicos(usuario: Usuario): UsuarioPublico {
  // Desestructuración con resto: saca `password` a su propia variable
  // y junta todo lo demás en `publico`, un objeto NUEVO.
  // El guion bajo indica que esa variable no se usa a propósito.
  const { password: _password, ...publico } = usuario;
  return publico;
}

export function resumen(usuario: Usuario): ResumenUsuario {
  // Armamos el objeto a mano, solo con lo que queremos mostrar.
  return { id: usuario.id, nombre: usuario.nombre };
}
