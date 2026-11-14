## Idea clave

`Resultado<T>` es una **unión discriminada genérica**: dos formas posibles (éxito con `valor`, fallo con `error`) que se distinguen por una propiedad literal, `ok`. Al comprobar `if (r.ok)`, TypeScript sabe cuál de las dos tienes y solo entonces te deja leer `valor`. Así el error no se puede ignorar por descuido.

## Paso a paso

1. **El problema del tipo del inicio.** `{ ok: boolean; valor?: T; error?: string }` acepta `{ ok: true }` sin valor, o `{ ok: false, valor: 5 }`. Y aunque compruebes `ok`, `valor` sigue siendo `T | undefined`: TypeScript no relaciona una propiedad con la otra.

2. **Escribe dos formas separadas con tipos literales.** `true` y `false` también son tipos (un tipo con un solo valor posible):

   ```ts
   export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };
   ```

   `ok` es el **discriminante**: está en las dos formas, con un valor literal distinto en cada una.

3. **Devuelve una u otra forma.** En `dividir`, una cláusula de guarda para el caso inválido y, si no, el éxito:

   ```ts
   if (b === 0) return { ok: false, error: "No se puede dividir entre cero" };
   return { ok: true, valor: a / b };
   ```

   TypeScript revisa que cada `return` encaje en una de las dos formas: `{ ok: true, error: "x" }` daría error.

4. **Convierte excepciones en resultados.** `JSON.parse` lanza `SyntaxError` con texto inválido. Lo atrapas una vez, dentro de `parsearJSON`, y quien la use ya no necesita `try/catch`:

   ```ts
   try {
     return { ok: true, valor: JSON.parse(texto) };
   } catch {
     return { ok: false, error: "JSON inválido" };
   }
   ```

   El valor es `unknown` porque no sabes qué forma tiene el JSON (para eso está el type guard del ejercicio "¿Es un usuario?").

5. **Usa el genérico para conectar tipos.** En `valorO<T>(resultado: Resultado<T>, porDefecto: T): T`, la misma `T` aparece tres veces: el valor por defecto tiene que ser del mismo tipo que el valor del resultado, y eso es lo que devuelves.

## Por qué funciona

Recorrido de `valorO(dividir(10, 2), 0)` y `valorO(dividir(1, 0), 0)`:

| Llamada | `dividir` devuelve | `resultado.ok` | Rama | Devuelve |
|---|---|---|---|---|
| `valorO(dividir(10, 2), 0)` | `{ ok: true, valor: 5 }` | `true` | `return resultado.valor` | `5` |
| `valorO(dividir(1, 0), 0)` | `{ ok: false, error: "No se..." }` | `false` | `return porDefecto` | `0` |

En los tipos: dentro de `if (resultado.ok)`, TypeScript descarta la forma `{ ok: false; ... }` porque su `ok` no puede ser `true`, así que `resultado` es `{ ok: true; valor: T }` y leer `valor` es válido. Fuera del `if`, `r.valor` da error: "La propiedad 'valor' no existe en el tipo `{ ok: false; error: string }`".

Con `valorO(dividir(1, 2), "cero")`, `T` sería `number` por el primer argumento, y `"cero"` no es `number`: error de tipos.

## Errores comunes

- **Escribir `ok: boolean` en las dos formas.** Entonces `ok` deja de discriminar y `if (r.ok)` no estrecha nada. Usa los literales `true` y `false`.
- **Lanzar un error en `dividir` en vez de devolverlo.** El test "sin lanzar" falla: la idea es que el error viaje como dato.
- **Olvidar el `try/catch` en `parsearJSON`.** El test con `"{malo"` explota con `SyntaxError: Unexpected token`.
- **Usar `any` en `valorO`.** Compila y funciona, pero `valorO(dividir(1, 2), "cero")` ya no da error y el resultado pierde su tipo.
- **Comprobar `if (r.valor)` en lugar de `if (r.ok)`.** Un valor `0` es falsy y lo tratarías como error; además TypeScript no te deja leer `valor` sin comprobar `ok` primero.

## Otra forma de resolverlo

**Lanzar errores y atraparlos donde se usan**: `dividir` haría `throw new Error(...)` y quien la llame usaría `try/catch`. Es lo más común en JavaScript, pero el tipo `number` no avisa de que la función puede fallar, y es fácil olvidar el `catch`.

**Discriminar con un texto** en vez de un booleano, muy usado para estados de carga en React:

```ts
type EstadoPedido<T> =
  | { estado: "cargando" }
  | { estado: "exito"; datos: T }
  | { estado: "error"; mensaje: string };
```

Es la misma idea con tres casos, y un `switch (e.estado)` estrecha el tipo en cada `case`. Usa `ok: true/false` cuando hay dos casos y un texto cuando hay más.

## Cómo explicarlo en la entrevista

> "En vez de lanzar excepciones, devuelvo un Resultado genérico: una unión discriminada con ok en true y el valor, u ok en false y un mensaje de error. Como ok es un literal, al hacer if (r.ok) TypeScript estrecha el tipo y solo ahí me deja leer el valor; así el compilador me obliga a manejar el error. En parsearJSON atrapo la excepción de JSON.parse y la convierto en un resultado. valorO es genérica para que el valor por defecto tenga el mismo tipo que el valor."

## Conceptos

- **Unión discriminada**: unión de objetos que comparten una propiedad literal que los distingue.
- **Tipos literales**: `true`, `false`, `"exito"` como tipos de un solo valor.
- **Narrowing por discriminante**: `if (r.ok)` o `switch (r.estado)` reducen la unión a un caso.
- **Genérico en un tipo (`Resultado<T>`)**: el mismo molde para cualquier tipo de valor.
- **`try/catch`**: atrapa excepciones; `catch` sin variable (`catch {}`) cuando no usas el error.
- **Errores como valores**: el fallo se devuelve, no se lanza; el tipo avisa que puede fallar.
- Repasa los temas de Aprender "TS: genéricos" y "TS: uniones y narrowing" y, en la Referencia, `JSON.parse`.
