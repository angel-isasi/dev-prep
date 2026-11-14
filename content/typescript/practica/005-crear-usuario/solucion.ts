export interface DatosUsuario {
  nombre: string;
  email: string;
  telefono?: string; // el `?` la vuelve opcional: puede no venir
}

export interface Usuario {
  readonly id: number; // se puede leer, pero no reasignar
  nombre: string;
  email: string;
  telefono?: string;
  activo: boolean;
}

export function crearUsuario(id: number, datos: DatosUsuario): Usuario {
  const usuario: Usuario = {
    id,
    nombre: datos.nombre.trim(),
    email: datos.email.trim().toLowerCase(),
    activo: true,
  };

  // datos.telefono es string | undefined: el `?.` evita llamar trim() sobre undefined.
  const telefono = datos.telefono?.trim();
  if (telefono) {
    // Se puede agregar después porque en Usuario la propiedad es opcional.
    usuario.telefono = telefono;
  }

  return usuario;
}
