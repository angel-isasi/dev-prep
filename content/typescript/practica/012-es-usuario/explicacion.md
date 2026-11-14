## Idea clave

`unknown` es "no sé qué es esto, compruébalo antes de usarlo". Un **type guard** es una función que hace esa comprobación y la anuncia en su tipo de retorno (`dato is Usuario`): si devuelve `true`, TypeScript trata al dato como `Usuario` desde ahí en adelante.

## Paso a paso

1. **Por qué `unknown` y no `any`.** Con `any`, TypeScript te deja escribir `dato.nombre.toUpperCase()` aunque `dato` sea `null`, y el error aparece recién en el navegador. Con `unknown` no te deja hacer **nada** hasta que compruebes qué es. Es la forma honesta de tipar lo que llega de una API, de `JSON.parse` o de `localStorage`.

2. **Descarta lo que no es objeto.** `typeof` devuelve `"object"` para objetos, arreglos **y `null`**. Por eso van las dos condiciones:

   ```ts
   if (typeof dato !== "object" || dato === null) return false;
   ```

   Después de esa línea, TypeScript ya sabe que `dato` es de tipo `object`.

3. **Comprueba cada propiedad con `in` y `typeof`.** `"id" in dato` responde "¿existe la propiedad?". Desde TypeScript 4.9, después de un `in`, TypeScript te deja leer `dato.id` (con tipo `unknown`), y el `typeof` lo afina a `number`:

   ```ts
   return (
     "id" in dato && typeof dato.id === "number" &&
     "nombre" in dato && typeof dato.nombre === "string" &&
     "email" in dato && typeof dato.email === "string"
   );
   ```

4. **Anuncia el resultado en el tipo de retorno.** Con `: boolean`, la función funciona, pero TypeScript no aprende nada: dentro del `if` el dato sigue siendo `unknown`. Con `: dato is Usuario`, el `if (esUsuario(x))` **estrecha** (narrowing) `x` a `Usuario`.

5. **Úsalo con `filter`.** `filter` tiene una versión especial: si le pasas un type guard, el arreglo resultante tiene el tipo comprobado. `datos.filter(esUsuario)` es `Usuario[]`, así que el `map` puede leer `.nombre`.

## Por qué funciona

Recorrido de `esUsuario` con tres datos:

| Dato | ¿Objeto y no null? | `id` número | `nombre` texto | `email` texto | Resultado |
|---|---|---|---|---|---|
| `{ id: 1, nombre: "Ana", email: "ana@correo.com" }` | sí | sí | sí | sí | `true` |
| `{ id: "1", nombre: "Ana", email: "..." }` | sí | **no** | | | `false` |
| `null` | **no** (`typeof null` es `"object"`, pero `=== null`) | | | | `false` |
| `[1, "Ana", "ana@correo.com"]` | sí (un arreglo es objeto) | **no** (`"id" in arreglo` es false) | | | `false` |

El `&&` corta en el primer `false`, así que nunca se lee una propiedad que no existe.

En `nombresDeUsuarios([{ Ana }, "hola", null, { id: 2, nombre: "Luis" }, { Rosa }])`, el `filter` deja `[{ Ana }, { Rosa }]` (a Luis le falta `email`) y el `map` produce `["Ana", "Rosa"]`.

## Errores comunes

- **Olvidar `dato === null`.** `typeof null === "object"` es una rareza histórica de JavaScript. Sin esa comprobación, `"id" in null` lanza `TypeError` en tiempo de ejecución.
- **Dejar el retorno como `boolean`.** Los tests de valores pasan, pero tsc falla: dentro del `if` el dato sigue siendo `unknown` y `dato.nombre` da error.
- **Usar `as Usuario` o `any` para "callar" a TypeScript.** Compila, pero no comprueba nada: si la API cambia, el error aparece en producción. Un type guard que miente (devuelve `true` sin revisar) es igual de peligroso: TypeScript le cree.
- **Comprobar solo que la propiedad exista.** `{ id: "1", ... }` tiene `id`, pero es texto. Hace falta el `typeof`.
- **Escribir `typeof dato.id === Number`.** `typeof` devuelve un texto: se compara con `"number"`, entre comillas y en minúscula.

## Otra forma de resolverlo

**Con una variable intermedia tipada como `Record<string, unknown>`**:

```ts
export function esUsuario(dato: unknown): dato is Usuario {
  if (typeof dato !== "object" || dato === null) return false;
  const obj = dato as Record<string, unknown>;
  return typeof obj.id === "number" && typeof obj.nombre === "string" && typeof obj.email === "string";
}
```

Es más corto y muy común en código real. El `as` aquí es seguro porque ya comprobaste que es un objeto y solo dices "tiene propiedades de tipo desconocido". La versión con `in` evita todo `as`.

**Con una librería de validación** como Zod (`z.object({ id: z.number(), ... })`), que en proyectos grandes genera el tipo y el type guard a la vez. Para una entrevista junior, saber escribir el type guard a mano es lo que se espera.

## Cómo explicarlo en la entrevista

> "Los datos que vienen de una API los tipo como unknown, no como any, porque unknown me obliga a comprobarlos antes de usarlos. Escribí un type guard: primero descarto lo que no es objeto, incluido null, y luego compruebo con in y typeof que cada propiedad exista y tenga el tipo correcto. El retorno es 'dato is Usuario', así TypeScript estrecha el tipo dentro del if. Y como filter acepta type guards, datos.filter(esUsuario) ya me da un Usuario[]."

## Conceptos

- **`unknown`**: tipo seguro para "cualquier cosa"; hay que estrecharlo antes de usarlo.
- **`any`**: desactiva la revisión de tipos; evítalo.
- **Narrowing (estrechamiento)**: TypeScript reduce el tipo de una variable según las comprobaciones (`typeof`, `in`, `=== null`).
- **Type guard (`x is T`)**: función que devuelve un booleano y le enseña a TypeScript el tipo cuando es `true`.
- **Operador `in`**: `"prop" in objeto` comprueba si la propiedad existe.
- **`typeof null === "object"`**: rareza de JavaScript que siempre hay que descartar.
- **`filter` con type guard**: devuelve un arreglo del tipo comprobado.
- Repasa el tema de Aprender "TS: funciones" (y "TS: uniones y narrowing") y, en la Referencia, `filter` y `JSON.parse`.
