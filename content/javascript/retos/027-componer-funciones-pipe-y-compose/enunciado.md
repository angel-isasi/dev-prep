Escribe dos funciones que **encadenan** varias funciones en una sola:

- `pipe(...fns)`: devuelve una función que recibe un valor y lo pasa por las funciones **de izquierda a derecha**: el resultado de una es la entrada de la siguiente.
- `compose(...fns)`: lo mismo, pero **de derecha a izquierda**.

## Reglas

- Las dos reciben cualquier cantidad de funciones, cada una de un solo argumento.
- Ninguna ejecuta nada al crearse: devuelven una función que espera el valor inicial.
- Si no recibes ninguna función, la función devuelta entrega el valor tal cual.
- La función compuesta se puede reutilizar con distintos valores.

## Ejemplos

```js
const limpiar = (s) => s.trim();
const minus = (s) => s.toLowerCase();
const slug = (s) => s.replace(/\s+/g, "-");

pipe(limpiar, minus, slug)("  Festival de Cortos ");   // "festival-de-cortos"
compose(slug, minus, limpiar)("  Hola Mundo ");        // "hola-mundo"

const sumar1 = (n) => n + 1;
const doble = (n) => n * 2;
pipe(sumar1, doble)(5);      // (5 + 1) * 2 = 12
compose(sumar1, doble)(5);   // (5 * 2) + 1 = 11

pipe()(7);                   // 7
```

## Por qué importa

Componer funciones pequeñas en vez de escribir una grande es la base de la programación funcional: limpiar datos de un formulario, transformar respuestas de una API o encadenar validaciones. `compose` aparece en Redux y en librerías como Ramda. En entrevistas es la forma clásica de ver si dominas `reduce` y las funciones que devuelven funciones.
