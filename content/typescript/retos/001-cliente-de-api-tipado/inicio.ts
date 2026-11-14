// Cliente de API tipado
//
// obtenerUsuarios(fetchFn) pide "/api/usuarios" con el fetch que recibe,
// revisa que la respuesta sea una lista de usuarios válidos (llega como
// `unknown`) y devuelve Promise<Usuario[]>. Si algo está mal, lanza un error claro.
//
//   const usuarios = await obtenerUsuarios(fetch);
//   // [{ id: 1, nombre: "Ana", email: "ana@correo.com" }]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

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

// Devuelve true si `valor` tiene la forma de un Usuario.
// Pista: cambia el tipo de retorno `boolean` para que sea un type guard.
export function esUsuario(valor: unknown): boolean {
  // Tu código aquí
  return false;
}

export async function obtenerUsuarios(fetchFn: FetchFn): Promise<Usuario[]> {
  // Tu código aquí
  return [];
}
