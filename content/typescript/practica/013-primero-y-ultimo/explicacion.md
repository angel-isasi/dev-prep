## Idea clave

Un **genérico** `<T>` es un tipo variable: la función dice "trabajo con listas de lo que sea, y devuelvo algo de ese mismo tipo". TypeScript reemplaza `T` por el tipo real en cada llamada, así no pierdes información como pasaría con `any`.

## Paso a paso

1. **El problema con `any`.** Con `primero(lista: any[]): any`, `primero(mensajes)` devuelve `any`: TypeScript ya no sabe que es un `Mensaje` y te deja escribir `.textto` (con error de tipeo) sin avisar.

2. **Declara el parámetro de tipo.** Va entre `<` y `>` después del nombre de la función y se usa como cualquier otro tipo:

   ```ts
   export function primero<T>(lista: T[]): T | undefined {
     return lista[0];
   }
   ```

   Se lee: "para cualquier tipo `T`, recibo un arreglo de `T` y devuelvo un `T` o `undefined`".

3. **No hace falta escribir `T` al llamar.** En `primero([1, 2, 3])` TypeScript ve un `number[]` y **infiere** `T = number`. Podrías escribir `primero<number>([1, 2, 3])`, pero casi nunca es necesario.

4. **Por qué `T | undefined`.** En JavaScript, `[][0]` es `undefined`, no un error. Si el retorno fuera solo `T`, estarías mintiendo: TypeScript te dejaría escribir `primero([]).texto` y explotaría en ejecución. Con `T | undefined`, quien use la función está obligado a comprobar.

5. **El último con `at(-1)`.** `lista.at(-1)` devuelve el último elemento, y su tipo en TypeScript ya es `T | undefined`:

   ```ts
   export function ultimo<T>(lista: T[]): T | undefined {
     return lista.at(-1);
   }
   ```

## Por qué funciona

| Llamada | `T` inferido | Valor | Tipo del resultado |
|---|---|---|---|
| `primero([10, 20, 30])` | `number` | `10` | `number` o `undefined` |
| `ultimo(["hola", "chau"])` | `string` | `"chau"` | `string` o `undefined` |
| `ultimo(mensajes)` | `Mensaje` | `{ autor: "Ana", texto: "Dale" }` | `Mensaje` o `undefined` |
| `primero([])` | `never` | `undefined` | `undefined` |

Con `const m = ultimo(mensajes)`, escribir `m.texto` da error: "m posiblemente es undefined". Las salidas correctas son `m?.texto` (encadenamiento opcional) o un `if (m)` antes. Ese error es exactamente el que te salva de un `Cannot read properties of undefined` en el navegador.

## Errores comunes

- **Dejar `any`.** Los tests de valores pasan, pero tsc falla en los `expectTypeOf` y en la directiva `@ts-expect-error` no usada.
- **Devolver solo `T`.** `function primero<T>(lista: T[]): T` compila (con las opciones por defecto, `lista[0]` se considera `T`), pero esconde el caso de la lista vacía. El test de tipos espera `T | undefined`.
- **Escribir `lista[-1]` para el último.** En JavaScript los índices negativos no cuentan desde el final con corchetes: `lista[-1]` es `undefined`. Usa `lista[lista.length - 1]` o `lista.at(-1)`.
- **Usar `pop()` o `shift()`.** Devuelven el elemento, pero **lo sacan** de la lista: modifican el arreglo original.
- **Declarar `T` y no usarlo en los parámetros.** `function primero<T>(lista: any[]): T` no deja que TypeScript infiera nada: `T` debe aparecer en lo que recibes.

## Otra forma de resolverlo

**Con índices clásicos**:

```ts
export function ultimo<T>(lista: T[]): T | undefined {
  return lista.length === 0 ? undefined : lista[lista.length - 1];
}
```

Funciona igual. Hace explícito el caso vacío, lo que ayuda a leerlo, pero `at(-1)` es más corto y ya resuelve el caso vacío solo.

**Con desestructuración** para el primero: `const [primerElemento] = lista; return primerElemento;`. Es útil cuando también quieres el resto (`const [cabeza, ...cola] = lista`).

Este patrón aparece en React: `useState<T>` es genérico. `useState<Usuario | null>(null)` es exactamente "un `Usuario` o nada", y te obliga a comprobar antes de leer `usuario.nombre`.

## Cómo explicarlo en la entrevista

> "Usé un genérico T para no atarme a un tipo: la función recibe un T[] y devuelve un T o undefined. TypeScript infiere T en cada llamada, así que con una lista de números el resultado es number | undefined y con una de mensajes es Mensaje | undefined. Incluí undefined en el retorno porque una lista vacía no tiene primer elemento; así el compilador obliga a comprobarlo antes de usarlo. Es mejor que any porque no pierdo la información del tipo."

## Conceptos

- **Genérico (`<T>`)**: parámetro de tipo; la función funciona para cualquier tipo sin perderlo.
- **Inferencia de tipos**: TypeScript deduce `T` por los argumentos.
- **Unión con `undefined`**: `T | undefined` documenta que puede no haber resultado.
- **`at(-1)`**: acceso con índice negativo desde el final.
- **Encadenamiento opcional (`?.`)**: lee una propiedad solo si el valor no es `null` ni `undefined`.
- **`any` vs genérico**: `any` apaga la revisión; el genérico la conserva.
- Repasa el tema de Aprender "TS: genéricos" y, en la Referencia, `at`.
