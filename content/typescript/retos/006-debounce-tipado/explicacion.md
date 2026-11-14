## Idea clave

Un **closure** guarda un único temporizador. Cada llamada **cancela** el anterior (`clearTimeout`) y programa uno nuevo (`setTimeout`), así que `fn` solo corre cuando pasan `ms` sin llamadas. Para los tipos, la función devuelta usa **`Parameters<F>`**: la tupla exacta de parámetros de `fn`, que TypeScript calcula a partir del genérico `F`.

## Paso a paso

1. **El genérico `F`.** `F extends (...args: any[]) => void` dice "F es alguna función". Al llamar `debounce(mover, 50)`, TypeScript infiere `F = (x: number, y: number, etiqueta: string) => void`.
2. **`Parameters<F>`.** Es un utility type que extrae los parámetros de una función como **tupla**: `[x: number, y: number, etiqueta: string]`. Escribir `(...args: Parameters<F>)` da a la función devuelta la misma firma que `fn`.
3. **El temporizador en el closure.** `let temporizador` vive dentro de `debounce`. Todas las llamadas a `debounced` lo comparten, pero cada `debounce(...)` crea el suyo: dos buscadores no se pisan.
4. **El tipo del temporizador.** `setTimeout` devuelve un `number` en el navegador y un objeto `Timeout` en Node. `ReturnType<typeof setTimeout>` toma "lo que devuelva `setTimeout` aquí" y funciona en los dos.
5. **Cada llamada:** `clearTimeout(temporizador)` (si no había ninguno, `clearTimeout(undefined)` no hace nada) y `temporizador = setTimeout(() => fn(...args), ms)`. El `args` que queda en el último `setTimeout` es el de la última llamada.
6. **`cancelar`.** Una propiedad agregada a la función. TypeScript permite asignar propiedades a una función guardada en `const` y las incluye en su tipo.
7. **`Debounced<F>`.** Es una **intersección** (`&`): "una función con la firma de `F`, **y además** un objeto con `cancelar`".

```ts
export type Debounced<F extends (...args: any[]) => void> = ((...args: Parameters<F>) => void) & {
  cancelar: () => void;
};

export function debounce<F extends (...args: any[]) => void>(fn: F, ms: number): Debounced<F> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      temporizador = undefined;
      fn(...args);
    }, ms);
  };

  debounced.cancelar = () => {
    clearTimeout(temporizador);
    temporizador = undefined;
  };

  return debounced;
}
```

¿Por qué `any[]` en la restricción y no `unknown[]`? Por la forma en que TypeScript compara funciones: una función que recibe `(x: number)` **no** se puede asignar a una que recibe `(...args: unknown[])`, porque esta última podría llamarla con un texto. Con `any[]` la restricción acepta cualquier función. Es uno de los pocos lugares donde `any` es lo idiomático: no se filtra al usuario, porque los tipos reales salen de `F`.

## Por qué funciona

Recorrido del test "cada llamada reinicia la espera" con `ms = 300`:

| Tiempo | Evento | Temporizador pendiente |
|---|---|---|
| 0 ms | `buscarConEspera("r")` | dispara `buscar("r")` en 300 ms |
| 200 ms | `buscarConEspera("re")`: `clearTimeout` + nuevo | dispara `buscar("re")` en 500 ms |
| 400 ms | (nada) | sigue esperando: `buscar` no se llamó |
| 500 ms | vence el temporizador | `buscar("re")` |

Y lo que calcula TypeScript con `mover`:

| Expresión | Tipo |
|---|---|
| `F` | `(x: number, y: number, etiqueta: string) => void` |
| `Parameters<F>` | `[x: number, y: number, etiqueta: string]` |
| `moverConEspera` | `((x: number, y: number, etiqueta: string) => void) & { cancelar: () => void }` |
| `moverConEspera("10", 20, "a")` | error: `"10"` no es `number` |

## Errores comunes

- **`(...args: any[])` en la función devuelta.** Funciona en ejecución, pero pierdes los tipos: `moverConEspera("10")` compila. Fallan los `@ts-expect-error`.
- **Declarar el temporizador dentro de la función devuelta.** Cada llamada tendría su propio temporizador y `clearTimeout` nunca cancelaría al anterior: `fn` se ejecutaría tres veces. Falla "la llama una sola vez".
- **No cancelar el anterior** (solo `setTimeout`). Mismo síntoma: una ejecución por cada llamada, con retraso.
- **`let temporizador: number`.** Compila con los tipos del navegador, pero en un proyecto que también carga los tipos de Node, `setTimeout` devuelve un `Timeout` y tsc se queja. `ReturnType<typeof setTimeout>` sirve en los dos casos.
- **Llamar `fn(args)` en vez de `fn(...args)`.** `fn` recibiría un solo argumento: el arreglo. Falla "pasa todos los argumentos".
- **Confundir debounce con throttle.** *Throttle* ejecuta como mucho una vez cada `ms` aunque sigas llamando (útil para el scroll). *Debounce* espera a que dejes de llamar (útil para buscar mientras escribes).

## Otra forma de resolverlo

**Con un genérico sobre los argumentos** en vez de sobre la función. Es más corto y no necesita `Parameters` ni `any`:

```ts
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), ms);
  };
  debounced.cancelar = () => clearTimeout(temporizador);
  return debounced;
}
```

TypeScript infiere `A = [x: number, y: number, etiqueta: string]` directamente de los parámetros de `fn`. Aquí `unknown[]` sí funciona, porque `A` se infiere de la función y no se compara contra ella.

**¿Cuándo conviene?** Las dos dan el mismo resultado para quien usa `debounce`. La de `Parameters<F>` es la que suelen pedir en entrevistas porque prueba que conoces los utility types de funciones (`Parameters`, `ReturnType`). La de `A extends unknown[]` es más limpia y es la que verás en muchas librerías. En React, para no recrear el debounce en cada render, se envuelve en `useMemo` o se usa un hook `useDebounce`.

## Cómo explicarlo en la entrevista

> "Guardo un temporizador en el closure. Cada llamada cancela el anterior con `clearTimeout` y programa uno nuevo, así la función original solo corre cuando pasan los milisegundos sin llamadas, con los últimos argumentos. Para los tipos hago `debounce` genérico en F, la función, y la versión que devuelvo recibe `Parameters<F>`, así conserva la firma exacta: si la llamo con un tipo incorrecto no compila. El temporizador lo tipo con `ReturnType<typeof setTimeout>` para que sirva en navegador y en Node. Y agrego `cancelar`, útil por ejemplo al desmontar un componente."

## Conceptos

- **Genéricos sobre funciones** (tema de Aprender: genéricos y funciones).
- **`Parameters<F>`** y **`ReturnType<F>`** (tema de Aprender: utility types).
- **Tuplas** y **parámetros rest** `...args`.
- **Tipos intersección** `A & B`.
- **Propiedades en funciones** (`debounced.cancelar = ...`).
- **Closures**: el temporizador compartido entre llamadas.
- **`setTimeout` y `clearTimeout`**.
- **Relojes falsos** en tests: `vi.useFakeTimers()` y `vi.advanceTimersByTime()`.
- **Debounce vs throttle**.
