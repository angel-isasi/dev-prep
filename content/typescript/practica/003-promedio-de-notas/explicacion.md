## Idea clave

Tipas la entrada como `number[]` y la salida como `number | null`. El `null` es la forma honesta de decir "no hay promedio", y al estar en el tipo de retorno, TypeScript **obliga** a quien usa la función a manejar ese caso antes de tratar el resultado como número.

## Paso a paso

1. **El caso vacío primero.** Si `notas.length === 0`, devuelve `null`. Si no lo haces, `0 / 0` da `NaN`, que es un `number` y se cuela en la pantalla como "NaN".
2. **Suma con `reduce`.** `notas.reduce((acc, nota) => acc + nota, 0)` recorre el array acumulando. El `0` del final es el valor inicial: con él la suma de un array vacío no explota y TypeScript sabe que `acc` es `number`.
3. **Divide entre la cantidad.** `suma / notas.length`.
4. **Anota los tipos.** `notas: number[]` para que nadie pase textos, y `: number | null` en el retorno para que el `null` sea parte del contrato.

```ts
export function promedio(notas: number[]): number | null {
  if (notas.length === 0) return null;
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  return suma / notas.length;
}
```

5. **Del lado de quien usa la función**: `const n: number = promedio(notas)` es un error, porque el resultado podría ser `null`. Lo resuelves con `promedio(notas) ?? 0`, o mejor, con un `if` que muestre "Sin notas" en la pantalla.

## Por qué funciona

Recorrido con `promedio([14, 16, 18])`:

| Paso | `acc` | `nota` | Resultado |
|---|---|---|---|
| Inicio | `0` | | |
| 1 | `0` | `14` | `14` |
| 2 | `14` | `16` | `30` |
| 3 | `30` | `18` | `48` |
| Divide | | | `48 / 3 = 16` |

Con `promedio([])`, el `if` devuelve `null` antes de llegar a la división.

Del lado de los tipos: TypeScript con `strict` activa `strictNullChecks`. Eso significa que `null` **no** es un `number`: `number | null` es otro tipo, más amplio. Por eso el test `const n: number = promedio([10])` debe fallar al compilar. Si tu función dijera `: number` y devolviera `null`, el error saldría dentro de la función.

## Errores comunes

- **Devolver `0` para el array vacío.** `0` es una nota real (y muy mala). El test "con ceros devuelve 0, sin notas null" lo distingue.
- **Olvidar el valor inicial de `reduce`.** `[].reduce((a, b) => a + b)` lanza "Reduce of empty array with no initial value". Siempre pon el `0`.
- **Anotar el retorno solo como `number`.** Entonces `return null` da error: "El tipo 'null' no se puede asignar al tipo 'number'".
- **Dejar `any` en la firma.** Todo compila, pero los `@ts-expect-error` de los tests quedan sin usar y `tsc` falla. `any` apaga la revisión de tipos.
- **Ordenar o modificar el array** (`notas.sort()`) para calcular algo: cambia el array del que llama.

## Otra forma de resolverlo

**Bucle `for...of`**:

```ts
export function promedio(notas: number[]): number | null {
  if (notas.length === 0) return null;
  let suma = 0;
  for (const nota of notas) suma += nota;
  return suma / notas.length;
}
```

Hace lo mismo y es más fácil de leer al principio. `reduce` es más corto y es lo que suelen esperar en una entrevista cuando hablan de "métodos de array".

**Devolver `undefined` en vez de `null`** (`number | undefined`) también es válido. En TypeScript se suele usar `undefined` para "no se pasó / no existe" y `null` para "existe, pero vacío a propósito". Lo importante es ser consistente en el proyecto.

## Cómo explicarlo en la entrevista

> "Recibo number[] y devuelvo number | null. Si el array está vacío devuelvo null en vez de 0 o NaN, porque no hay promedio y un 0 sería una nota falsa. Si hay notas, sumo con reduce empezando en 0 y divido entre la cantidad. La ventaja de poner null en el tipo es que, con strictNullChecks, quien use la función está obligado a manejar el caso sin notas antes de mostrarlo."

## Conceptos

- **Array tipado**: `number[]` (también se escribe `Array<number>`).
- **Unión con `null`**: `number | null`, un valor que puede faltar.
- **`strictNullChecks`**: con `strict`, `null` y `undefined` no se pueden usar como si fueran el tipo normal.
- **`??` (nullish coalescing)**: `p ?? 0` usa 0 solo si `p` es `null` o `undefined`.
- **`reduce` con valor inicial**: `arr.reduce((acc, x) => acc + x, 0)`.
- Tema de Aprender: tipos básicos de TypeScript y métodos de array.
