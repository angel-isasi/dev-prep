Escribe la función `obtenerUsuarios(fetchFn)` que pide la lista de usuarios a una API y devuelve `Promise<Usuario[]>`. Y la función `esUsuario(valor)`, un **type guard** que revisa si un valor desconocido tiene la forma de un `Usuario`.

La idea central: lo que llega de una API es **`unknown`**. TypeScript no puede saber qué te mandó el servidor, así que antes de decir "esto es un `Usuario[]`" tienes que **comprobarlo** en tiempo de ejecución.

`fetchFn` es la función con la que pides los datos. En la app real le pasas el `fetch` del navegador; en los tests se le pasa un `fetch` falso, para probar sin internet. A esto se le llama **inyectar una dependencia**.

## Tipos (ya vienen en el archivo de inicio)

```ts
type Usuario = { id: number; nombre: string; email: string };

type RespuestaHttp = { ok: boolean; status: number; json(): Promise<unknown> };
type FetchFn = (url: string) => Promise<RespuestaHttp>;
```

## Reglas

- `esUsuario(valor: unknown)` devuelve `true` solo si `valor` es un objeto (no `null`) con `id` número, `nombre` texto y `email` texto. Su tipo de retorno debe ser un **type guard**: `valor is Usuario`.
- `obtenerUsuarios(fetchFn)`:
  1. Llama a `fetchFn("/api/usuarios")`.
  2. Si `respuesta.ok` es `false`, lanza `new Error("HTTP " + status)`, por ejemplo `"HTTP 500"`.
  3. Lee el cuerpo con `await respuesta.json()` (es `unknown`).
  4. Si no es un arreglo, lanza `new Error("Respuesta inválida: se esperaba una lista")`.
  5. Si algún elemento no es un usuario válido, lanza `new Error("Usuario inválido en la posición N")`, con N el índice del primero que falle.
  6. Devuelve los usuarios con **solo** `id`, `nombre` y `email` (descarta campos extra, como un `password` que el servidor mandó por error).
- No uses `any` ni `as Usuario[]`: el objetivo es que TypeScript **sepa** que validaste.

## Ejemplos

```ts
// El servidor responde 200 con [{ id: 1, nombre: "Ana", email: "ana@correo.com", rol: "admin" }]
await obtenerUsuarios(fetch);
// [{ id: 1, nombre: "Ana", email: "ana@correo.com" }]

// El servidor responde 500
await obtenerUsuarios(fetch);  // Error: HTTP 500

// El servidor responde 200 con { usuarios: [...] }
await obtenerUsuarios(fetch);  // Error: Respuesta inválida: se esperaba una lista

// El servidor responde 200 con [ana, { id: "2", nombre: "Luis", email: "..." }]
await obtenerUsuarios(fetch);  // Error: Usuario inválido en la posición 1

esUsuario({ id: 1, nombre: "Ana", email: "a@b.com" });  // true
esUsuario({ id: 1, nombre: "Ana" });                    // false
esUsuario(null);                                        // false
```

## Por qué importa

Los tipos de TypeScript **desaparecen** al ejecutar: no protegen de un servidor que cambia el formato. Escribir `const datos = await r.json() as Usuario[]` es mentirle al compilador, y el error aparece lejos, en un componente que hace `usuario.nombre.toUpperCase()` sobre `undefined`. Validar en la frontera (donde entran los datos) es lo que hace un frontend robusto, y en entrevistas es una pregunta clásica: "¿qué diferencia hay entre `any` y `unknown`?".
