## Idea clave

Componer es encadenar funciones: la salida de una es la entrada de la otra. `componer(f, g)` devuelve una función nueva que hace `f(g(x))`. Se lee de derecha a izquierda: **primero `g`, luego `f`**, igual que en matemáticas, donde (f ∘ g)(x) = f(g(x)).

## Paso a paso

1. **Recibe las dos funciones** `f` y `g`.
2. **Devuelve una función nueva** que recibe `x`.
3. **Dentro, aplica `g` a `x`**: `g(x)`.
4. **Al resultado, aplícale `f`** y devuélvelo: `f(g(x))`.

```js
export function componer(f, g) {
  return (x) => f(g(x));
}
```

## Por qué funciona

JavaScript evalúa de adentro hacia afuera: para calcular `f(g(x))` primero necesita el argumento de `f`, que es `g(x)`.

Recorrido con `componer(gritar, sinEspacios)("  ica ")`:

| Paso | Expresión | Valor |
|---|---|---|
| 1 | `x` | `"  ica "` |
| 2 | `g(x)` = `sinEspacios("  ica ")` | `"ica"` |
| 3 | `f("ica")` = `gritar("ica")` | `"ICA!"` |

Y por qué el orden importa, con `sumar1` y `doble`:

| Código | Qué hace | Resultado |
|---|---|---|
| `componer(doble, sumar1)(5)` | `doble(sumar1(5))` = `doble(6)` | `12` |
| `componer(sumar1, doble)(5)` | `sumar1(doble(5))` = `sumar1(10)` | `11` |

**¿Qué queda recordado?** La función devuelta recuerda `f` y `g` gracias al closure. Por eso puedes guardarla con un nombre (`limpiarYGritar`) y usarla cuantas veces quieras.

## Errores comunes

- **Invertir el orden: `g(f(x))`.** Con texto puede fallar de forma rara: `sinEspacios(gritar("  ica "))` da `"ICA !"` (el `!` se pega antes de quitar espacios). Con números, el test "aplica primero g y después f" recibe `11` en vez de `12`.
- **Ejecutar en vez de devolver una función: `return f(g)`.** Le pasas la función `g` como si fuera un texto o número. El test "devuelve una función" falla y los demás dicen "is not a function" o dan resultados como `"(S) => S.TRIM()!"`.
- **Llamar a las funciones por separado sin conectar: `(x) => { g(x); return f(x); }`.** Calculas `g(x)` pero lo tiras. Recibes `"  ICA !"` en vez de `"ICA!"`.
- **Olvidar el `return` con llaves: `(x) => { f(g(x)) }`.** La función devuelve `undefined`.

## Otra forma de resolverlo

Generalizar a **cualquier cantidad** de funciones con `reduceRight`, que recorre el array de derecha a izquierda:

```js
export function componerVarias(...fns) {
  return (x) => fns.reduceRight((valor, fn) => fn(valor), x);
}

componerVarias(gritar, sinEspacios)("  ica ");  // "ICA!"
```

El acumulador empieza en `x`, y en cada vuelta se le aplica una función, empezando por la última del array. Si prefieres leer de izquierda a derecha (primero la primera), usa `reduce` en vez de `reduceRight`; a eso se le suele llamar `pipe`.

**¿Cuál conviene?** Si te piden "componer dos funciones", la de una línea es perfecta. Si te piden `compose` de varias, la de `reduceRight` es la respuesta clásica. Mencionar la diferencia entre `compose` (derecha a izquierda) y `pipe` (izquierda a derecha) suma puntos.

## Cómo explicarlo en la entrevista

> "`componer` recibe dos funciones y devuelve una nueva que aplica primero `g` y al resultado le aplica `f`, o sea `f(g(x))`. Gracias al closure, la función devuelta recuerda `f` y `g`. El orden importa: se lee de derecha a izquierda como en matemáticas. Para más de dos funciones lo generalizaría con `reduceRight`, y si quisiera el orden de lectura natural, usaría `pipe` con `reduce`."

## Conceptos

- **Composición de funciones**: combinar funciones para que la salida de una sea la entrada de la siguiente.
- **Evaluación de adentro hacia afuera**: en `f(g(x))`, primero se calcula `g(x)`.
- **Función de orden superior**: `componer` recibe funciones y devuelve una función.
- **Closure**: la función compuesta recuerda `f` y `g`.
- **`reduceRight`**: como `reduce`, pero recorre el array desde el final.
- **`compose` vs `pipe`**: el mismo encadenamiento, en orden inverso.
