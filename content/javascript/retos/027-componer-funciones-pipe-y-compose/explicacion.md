## Idea clave

Un valor recorre una **cadena de funciones**: cada una recibe lo que devolvió la anterior. Eso es exactamente lo que hace `reduce` con un acumulador. `pipe` recorre de izquierda a derecha con `reduce`; `compose`, de derecha a izquierda con `reduceRight`.

## Paso a paso

1. **Recibe las funciones con rest**: `...fns` las junta en un arreglo.
2. **Devuelve una función** que espera `valorInicial`. Nada se ejecuta todavía.
3. **Cuando la llaman**, recorre `fns` con `reduce`, usando `valorInicial` como acumulador.
4. **En cada paso**, el acumulador se reemplaza por `fn(valor)`.
5. **`compose`** es igual, pero con `reduceRight`, que recorre desde el último elemento.

```js
export function pipe(...fns) {
  return (valorInicial) => fns.reduce((valor, fn) => fn(valor), valorInicial);
}

export function compose(...fns) {
  return (valorInicial) => fns.reduceRight((valor, fn) => fn(valor), valorInicial);
}
```

## Por qué funciona

`pipe(limpiar, minus, slug)("  Festival de Cortos ")`:

| Paso | `fn` | `valor` antes | `valor` después |
|---|---|---|---|
| inicio | | `"  Festival de Cortos "` | |
| 1 | `limpiar` | `"  Festival de Cortos "` | `"Festival de Cortos"` |
| 2 | `minus` | `"Festival de Cortos"` | `"festival de cortos"` |
| 3 | `slug` | `"festival de cortos"` | `"festival-de-cortos"` |

Con números se ve bien la diferencia de orden:

- `pipe(sumar1, doble)(5)`: primero `sumar1` (6), luego `doble` (12).
- `compose(sumar1, doble)(5)`: `reduceRight` empieza por el final, primero `doble` (10), luego `sumar1` (11). Es como leer `sumar1(doble(5))`: así se escribe en matemáticas.

Sin funciones, `[].reduce(fn, 7)` no da ninguna vuelta y devuelve el valor inicial, 7. Por eso `pipe()(7)` funciona sin código extra.

## Errores comunes

- **Olvidar el valor inicial de `reduce`.** Sin él, el acumulador empieza siendo la **primera función** y le aplicas la segunda a una función. Lo reconoces por resultados raros como textos con código de funciones, o por un `TypeError` con el arreglo vacío.
- **Ejecutar en el momento: `return fns.reduce(...)` sin envolver en una función.** `pipe` devolvería un valor, no una función. Lo reconoces por "pipe(...) is not a function".
- **Escribir `compose` con `fns.reverse().reduce(...)` dentro de la función devuelta.** `reverse()` **modifica** el arreglo `fns`: la primera llamada funciona, pero la segunda lo vuelve a invertir y aplica las funciones en el orden equivocado. Lo reconoces porque la función compuesta da resultados distintos cada vez que la llamas.
- **Confundir los parámetros del callback: `(fn, valor) => fn(valor)`.** En `reduce`, el primero es siempre el acumulador. Lo reconoces por "fn is not a function".

## Otra forma de resolverlo

Con un bucle, sin `reduce`:

```js
export function pipe(...fns) {
  return (valorInicial) => {
    let valor = valorInicial;
    for (const fn of fns) valor = fn(valor);
    return valor;
  };
}

export function compose(...fns) {
  return pipe(...[...fns].reverse());
}
```

El bucle hace visible el "pasar de mano en mano". Y `compose` se define reutilizando `pipe` con las funciones al revés: `[...fns]` copia el arreglo antes de `reverse()`, así no se modifica el original. Conviene si te cuesta leer `reduce`; en la entrevista, la versión con `reduce` en una línea suele causar mejor impresión, siempre que sepas explicarla.

## Cómo explicarlo en la entrevista

> "`pipe` devuelve una función que recibe un valor y lo pasa por cada función de izquierda a derecha, usando el resultado de una como entrada de la siguiente. Eso es justo lo que hace `reduce` con el valor inicial como acumulador. `compose` hace lo mismo de derecha a izquierda con `reduceRight`, como la composición en matemáticas. Si no hay funciones, devuelve el valor tal cual. Sirve para armar transformaciones pequeñas y reutilizables, como limpiar el texto de un formulario."

## Conceptos

- **Composición de funciones**: `compose(f, g)(x)` es `f(g(x))`.
- **`pipe`**: la misma idea en el orden de lectura, de izquierda a derecha.
- **`reduce` con valor inicial**: el acumulador empieza en ese valor y se transforma en cada vuelta.
- **`reduceRight`**: como `reduce`, pero empieza desde el final del arreglo.
- **Parámetros rest `...fns`**: juntan cualquier cantidad de argumentos en un arreglo.
- **Funciones que devuelven funciones**: preparan un comportamiento para ejecutarlo después.
