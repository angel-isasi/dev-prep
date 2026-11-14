export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

// `dato is Usuario` es un type guard: si la función devuelve true,
// TypeScript trata a `dato` como Usuario en el código que sigue.
export function esUsuario(dato: unknown): dato is Usuario {
  // 1. Tiene que ser un objeto. Ojo: typeof null también es "object".
  if (typeof dato !== "object" || dato === null) return false;

  // 2. Cada propiedad tiene que existir ("in") y tener el tipo correcto (typeof).
  //    Después de cada "in", TypeScript ya permite leer esa propiedad.
  return (
    "id" in dato &&
    typeof dato.id === "number" &&
    "nombre" in dato &&
    typeof dato.nombre === "string" &&
    "email" in dato &&
    typeof dato.email === "string"
  );
}

export function nombresDeUsuarios(datos: unknown[]): string[] {
  // filter con un type guard devuelve Usuario[], no unknown[]:
  // por eso en el map ya puedes leer `.nombre` sin errores.
  return datos.filter(esUsuario).map((usuario) => usuario.nombre);
}
