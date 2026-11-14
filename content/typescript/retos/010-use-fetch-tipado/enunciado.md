Crea el hook genérico `useFetch<T>(url, fetchFn)` que pide datos y devuelve su estado como una **unión discriminada**, y el componente `ListaUsuarios` que lo usa.

La versión típica en JavaScript devuelve `{ datos, error, cargando }` con tres campos sueltos. Eso permite combinaciones absurdas (¿`cargando: true` y `error` a la vez?) y obliga a revisar `datos !== null` en todas partes. Con una unión discriminada, cada estado trae **solo** lo que tiene sentido.

## Tipos

```ts
type EstadoFetch<T> =
  | { estado: "cargando" }
  | { estado: "exito"; datos: T }
  | { estado: "error"; error: string };

// Ya viene en el inicio. El fetch real encaja en este tipo.
type FetchFn = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

type Usuario = { id: number; nombre: string };
```

`fetchFn` se recibe como parámetro (en la app le pasas `fetch`) para poder probar sin internet.

## Reglas

**`useFetch<T>(url: string, fetchFn: FetchFn): EstadoFetch<T>`**

- Empieza en `{ estado: "cargando" }`.
- Llama a `fetchFn(url)`:
  - Si la respuesta tiene `ok` en `false`: `{ estado: "error", error: "HTTP <status>" }`, por ejemplo `"HTTP 404"`.
  - Si `fetchFn` lanza un error: `{ estado: "error", error: <su mensaje> }`. Si lo lanzado no es un `Error`, usa `"Error desconocido"`.
  - Si sale bien: `{ estado: "exito", datos }`, con `datos` el resultado de `json()`.
- Si la `url` cambia, vuelve a `{ estado: "cargando" }` y pide la nueva.
- **Condición de carrera:** si una respuesta de una url anterior llega tarde, se ignora.

**`ListaUsuarios({ fetchFn })`** usa `useFetch<Usuario[]>("/api/usuarios", fetchFn)` y muestra:

| Estado | Se ve |
|---|---|
| `cargando` | `<p>Cargando…</p>` (con el carácter `…`) |
| `error` | `<p role="alert">` con el mensaje |
| `exito` | un `<ul>` con un `<li>` por usuario, con su `nombre` (y `key` = `id`) |

## Ejemplos

```tsx
const r = useFetch<Usuario[]>("/api/usuarios", fetch);

r.datos;                       // Error de TypeScript: puede que todavía esté cargando
if (r.estado === "exito") {
  r.datos;                     // Usuario[]
}
if (r.estado === "error") {
  r.error;                     // string
}

<ListaUsuarios fetchFn={fetch} />
// primero: Cargando…
// luego:   • Ana  • Luis
```

## Por qué importa

Cargar datos es lo que hace casi cualquier pantalla. Este reto junta lo más útil de TypeScript en React: un **hook genérico** (el que lo usa decide qué es `T`), una **unión discriminada** para el estado (los estados imposibles no se pueden escribir) y el manejo de errores con `catch (error)` de tipo `unknown`. Además repasa la condición de carrera de los efectos, un bug real que en entrevistas suma muchos puntos si lo mencionas.
