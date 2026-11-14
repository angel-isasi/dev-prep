import { useEffect, useState } from "react";

// Unión discriminada: según `estado`, existen `datos` o `error` (nunca los dos).
export type EstadoFetch<T> =
  | { estado: "cargando" }
  | { estado: "exito"; datos: T }
  | { estado: "error"; error: string };

// Lo mínimo que usamos de fetch. El `fetch` real encaja en este tipo.
export type FetchFn = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export function useFetch<T>(url: string, fetchFn: FetchFn): EstadoFetch<T> {
  const [resultado, setResultado] = useState<EstadoFetch<T>>({ estado: "cargando" });

  useEffect(() => {
    // `activo` pasa a false si la url cambia o el componente se desmonta.
    let activo = true;
    setResultado({ estado: "cargando" });

    async function cargar() {
      try {
        const respuesta = await fetchFn(url);
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        // json() da unknown: confiamos en que la API cumple el tipo T.
        const datos = (await respuesta.json()) as T;
        if (activo) setResultado({ estado: "exito", datos });
      } catch (error) {
        // En modo estricto, `error` es unknown: puede no ser un Error.
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        if (activo) setResultado({ estado: "error", error: mensaje });
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [url, fetchFn]);

  return resultado;
}

export type Usuario = { id: number; nombre: string };

export function ListaUsuarios({ fetchFn }: { fetchFn: FetchFn }) {
  const resultado = useFetch<Usuario[]>("/api/usuarios", fetchFn);

  // Gracias a la unión discriminada, en cada rama TypeScript sabe qué hay.
  if (resultado.estado === "cargando") return <p>Cargando…</p>;
  if (resultado.estado === "error") return <p role="alert">{resultado.error}</p>;
  return (
    <ul>
      {resultado.datos.map((u) => (
        <li key={u.id}>{u.nombre}</li>
      ))}
    </ul>
  );
}
