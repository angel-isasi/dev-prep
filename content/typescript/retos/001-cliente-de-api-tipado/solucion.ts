export type Usuario = {
  id: number;
  nombre: string;
  email: string;
};

// Lo mínimo que usamos de una respuesta. El `fetch` real encaja en este tipo.
export type RespuestaHttp = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};

export type FetchFn = (url: string) => Promise<RespuestaHttp>;

// Type guard: si devuelve true, TypeScript sabe que `valor` es un Usuario.
export function esUsuario(valor: unknown): valor is Usuario {
  if (typeof valor !== "object" || valor === null) return false;
  // Ahora `valor` es `object`: con `in` revisamos que tenga cada propiedad.
  return (
    "id" in valor &&
    typeof valor.id === "number" &&
    "nombre" in valor &&
    typeof valor.nombre === "string" &&
    "email" in valor &&
    typeof valor.email === "string"
  );
}

export async function obtenerUsuarios(fetchFn: FetchFn): Promise<Usuario[]> {
  const respuesta = await fetchFn("/api/usuarios");
  // fetch no falla con 404 o 500: hay que revisarlo a mano.
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

  const datos = await respuesta.json(); // unknown: todavía no sabemos qué llegó
  if (!Array.isArray(datos)) throw new Error("Respuesta inválida: se esperaba una lista");

  return datos.map((item, i) => {
    if (!esUsuario(item)) throw new Error(`Usuario inválido en la posición ${i}`);
    // Aquí `item` ya es Usuario. Copiamos solo los campos que conocemos.
    return { id: item.id, nombre: item.nombre, email: item.email };
  });
}
