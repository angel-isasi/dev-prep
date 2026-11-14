## Idea clave

Lo que llega de afuera (una API, `localStorage`, un archivo) es **`unknown`**: TypeScript no puede adivinarlo. Para convertirlo en `Usuario[]` sin mentir, lo **compruebas en tiempo de ejecución** con un **type guard** (`valor is Usuario`): una función que devuelve un booleano y que, cuando da `true`, le enseña a TypeScript qué tipo tiene el valor.

## Paso a paso

1. **`esUsuario` empieza descartando lo que no es objeto.** Con `unknown` no puedes leer ninguna propiedad. `typeof valor !== "object" || valor === null` deja fuera números, textos, `undefined` y `null` (que, por un error histórico de JavaScript, también es `"object"`).
2. **Después, `in` y `typeof` por cada campo.** Tras el primer `if`, `valor` es `object`. La expresión `"id" in valor` le dice a TypeScript que `valor` tiene una propiedad `id` (de tipo `unknown`), y `typeof valor.id === "number"` la vuelve `number`. Repites con `nombre` y `email`.
3. **El tipo de retorno `valor is Usuario`.** Es lo que convierte la función en type guard. Con `boolean`, el `if (esUsuario(x))` no cambiaría el tipo de `x`.
4. **`obtenerUsuarios` llama a `fetchFn` y revisa `ok`.** `fetch` solo rechaza la promesa si no hubo respuesta (sin red). Un 404 o un 500 llegan como respuestas normales con `ok: false`.
5. **`await respuesta.json()` da `unknown`.** Primero, `Array.isArray(datos)`: si no es arreglo, lanzas el error de "se esperaba una lista".
6. **Recorres con `map` y el índice.** Si un elemento no pasa `esUsuario`, lanzas el error con su posición. Si pasa, TypeScript ya sabe que es `Usuario` y puedes leer `item.id` sin errores.
7. **Copias solo los campos conocidos.** Así un `password` o un `rol` que el servidor mandó por error no se cuela en tu app.

```ts
export function esUsuario(valor: unknown): valor is Usuario {
  if (typeof valor !== "object" || valor === null) return false;
  return (
    "id" in valor && typeof valor.id === "number" &&
    "nombre" in valor && typeof valor.nombre === "string" &&
    "email" in valor && typeof valor.email === "string"
  );
}

export async function obtenerUsuarios(fetchFn: FetchFn): Promise<Usuario[]> {
  const respuesta = await fetchFn("/api/usuarios");
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

  const datos = await respuesta.json();
  if (!Array.isArray(datos)) throw new Error("Respuesta inválida: se esperaba una lista");

  return datos.map((item, i) => {
    if (!esUsuario(item)) throw new Error(`Usuario inválido en la posición ${i}`);
    return { id: item.id, nombre: item.nombre, email: item.email };
  });
}
```

Un `throw` dentro de una función `async` hace que la promesa que devuelve se **rechace** con ese error. Por eso en los tests se usa `await expect(...).rejects.toThrow(...)`.

## Por qué funciona

Recorrido con una respuesta `200` y el cuerpo `[ana, { id: "2", nombre: "Luis", email: "luis@correo.com" }]`:

| Paso | Valor | Tipo para TypeScript | Resultado |
|---|---|---|---|
| `respuesta.ok` | `true` | `boolean` | sigue |
| `datos` | el arreglo | `unknown` | |
| `Array.isArray(datos)` | `true` | ahora `any[]` | sigue |
| `i = 0`, `esUsuario(ana)` | `true` | `item` pasa a `Usuario` | devuelve `{ id: 1, nombre: "Ana", ... }` |
| `i = 1`, `esUsuario(luis)` | `typeof "2" === "number"` es `false` | | lanza `"Usuario inválido en la posición 1"` |

Y cómo cambia el tipo de `valor` dentro de `esUsuario({ id: 1, nombre: "Ana", email: "a@b.com" })`:

| Comprobación | Tipo de `valor` después |
|---|---|
| (inicio) | `unknown` |
| `typeof valor === "object" && valor !== null` | `object` |
| `"id" in valor` | `object & Record<"id", unknown>` |
| `typeof valor.id === "number"` | `valor.id` es `number` |

Este "estrechamiento" del tipo paso a paso se llama **narrowing**. El type guard empaqueta todas esas comprobaciones en una función reutilizable.

## Errores comunes

- **`return datos as Usuario[]`.** Compila, pero es una promesa vacía: si el servidor manda `{ usuarios: [...] }`, tu app revienta lejos de aquí. Fallan los tests de "se esperaba una lista" y "posición 1".
- **Usar `any` en vez de `unknown`.** Con `any` TypeScript deja de revisar todo: `datos.loQueSea.otraCosa` compila. `unknown` te **obliga** a comprobar antes de usar.
- **Tipo de retorno `boolean` en `esUsuario`.** La función funciona, pero el `if (esUsuario(x))` no estrecha el tipo. Falla el caso de tsc del último test.
- **Olvidar `valor !== null`.** `typeof null === "object"`, así que `"id" in null` lanza `TypeError`. Falla `esUsuario(null)`.
- **No revisar `respuesta.ok`.** Con un 500 intentas leer el cuerpo de error como si fueran usuarios y el mensaje termina siendo "se esperaba una lista", que confunde.
- **Devolver `item` tal cual.** Los campos extra (`password`) viajan al resto de la app. Falla "descarta los campos que no son de Usuario".
- **Ojo con `Array.isArray`:** sobre `unknown` lo convierte en `any[]`, no en `unknown[]`. Por eso es importante pasar cada elemento por `esUsuario` y no confiar en el arreglo.

## Otra forma de resolverlo

**Con un bucle `for` y un arreglo de resultado**, en vez de `map`:

```ts
const lista: unknown[] = datos; // forzamos unknown[] para que nada sea any
const usuarios: Usuario[] = [];
for (let i = 0; i < lista.length; i++) {
  const item = lista[i];
  if (!esUsuario(item)) throw new Error(`Usuario inválido en la posición ${i}`);
  usuarios.push({ id: item.id, nombre: item.nombre, email: item.email });
}
return usuarios;
```

Es más largo, pero deja claro que cada `item` empieza como `unknown`.

**Con una librería de validación** como **Zod**, que es lo que verás en proyectos reales: describes el esquema una vez y te da la validación y el tipo a la vez.

```ts
const UsuarioSchema = z.object({ id: z.number(), nombre: z.string(), email: z.string() });
type Usuario = z.infer<typeof UsuarioSchema>;
const usuarios = z.array(UsuarioSchema).parse(datos); // lanza si no cumple
```

**¿Cuándo conviene?** El type guard a mano no necesita dependencias y te enseña cómo funciona el narrowing: es lo que esperan ver en una entrevista. Zod conviene cuando hay muchos tipos que validar, porque no repites cada campo dos veces (en el tipo y en la validación).

## Cómo explicarlo en la entrevista

> "Lo que devuelve `json()` lo trato como `unknown`, porque TypeScript no puede saber qué mandó el servidor y los tipos no existen en tiempo de ejecución. Primero reviso `ok`, porque `fetch` no falla con un 500. Luego compruebo que sea un arreglo y paso cada elemento por un type guard, `esUsuario`, que revisa con `typeof` e `in` cada campo; como su retorno es `valor is Usuario`, después del `if` TypeScript ya sabe el tipo sin que yo use `as`. Si algo falla lanzo un error que dice qué y dónde. Además recibo el `fetch` como parámetro para poder testear sin red. En un proyecto grande usaría Zod para no duplicar el tipo y la validación."

## Conceptos

- **`unknown` vs `any`**: `unknown` obliga a comprobar, `any` desactiva la revisión (tema de Aprender: tipos básicos).
- **Narrowing** con `typeof`, `in` y `Array.isArray` (tema de Aprender: uniones y narrowing).
- **Type guard**: función con retorno `valor is Tipo`.
- **Tipar funciones async**: el retorno es `Promise<T>` (tema de Aprender: funciones).
- **Tipos de función** como parámetro: `type FetchFn = (url: string) => Promise<RespuestaHttp>`.
- **Inyección de dependencias**: recibir `fetch` como parámetro para poder reemplazarlo en los tests.
- **`fetch` y `respuesta.ok`**: los errores HTTP no rechazan la promesa.
- **Validar en la frontera**: comprobar los datos justo donde entran a tu app.
