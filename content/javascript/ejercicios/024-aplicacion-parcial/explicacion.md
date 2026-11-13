## Idea clave

Fijas algunos argumentos **ahora** y recibes el resto **después**. `parcial` guarda los argumentos fijos en un closure y devuelve una función que, cuando la llamen, junta los fijos con los nuevos y ejecuta la función original con todos.

## Paso a paso

1. **Recibe la función y los argumentos fijos.** Con `...fijos` en los parámetros, todo lo que venga después de `fn` queda en un array. Con `parcial(saludar, "Hola")`, `fijos` es `["Hola"]`.
2. **Devuelve una función nueva** que recibe el resto con `(...resto)`.
3. **Dentro, llama a `fn`** esparciendo los dos arrays en orden: `fn(...fijos, ...resto)`.
4. **Devuelve** lo que devuelva `fn`.

```js
export function parcial(fn, ...fijos) {
  return (...resto) => fn(...fijos, ...resto);
}
```

## Por qué funciona

Recorrido con `const sumar3 = (a, b, c) => a + b + c`:

| Código | `fijos` | `resto` | Se ejecuta | Resultado |
|---|---|---|---|---|
| `parcial(sumar3, 1, 2)(3)` | `[1, 2]` | `[3]` | `sumar3(1, 2, 3)` | `6` |
| `parcial(sumar3, 1)(2, 3)` | `[1]` | `[2, 3]` | `sumar3(1, 2, 3)` | `6` |
| `parcial(sumar3)(1, 2, 3)` | `[]` | `[1, 2, 3]` | `sumar3(1, 2, 3)` | `6` |

Los tres puntos significan cosas distintas según dónde estén:

- En los **parámetros** (`...fijos`, `...resto`) son **rest**: juntan los argumentos sueltos en un array.
- En una **llamada** (`fn(...fijos, ...resto)`) son **spread**: abren los arrays y los pasan como argumentos sueltos. `fn(...[1], ...[2, 3])` es `fn(1, 2, 3)`.

**¿Qué queda recordado?** `fn` y `fijos`. La función devuelta (por ejemplo, `hola`) los guarda en su closure, así que puedes llamarla muchas veces con distintos nombres y el `"Hola"` sigue ahí. `resto`, en cambio, es nuevo en cada llamada.

## Errores comunes

- **Pasar los arrays sin esparcir: `fn(fijos, resto)`.** `fn` recibe dos arrays en vez de valores sueltos. Con `saludar` recibes `"Hola, Angel"` por casualidad (los arrays de un elemento se convierten a texto igual), pero con `sumar3` recibes algo como `"1,23undefined"` en vez de `6`.
- **Invertir el orden: `fn(...resto, ...fijos)`.** El test "los fijos van antes que los nuevos" falla: `diezMenos(3)` devuelve `3 - 10 = -7` en vez de `7`.
- **Ejecutar `fn` dentro de `parcial` en vez de devolver una función: `return fn(...fijos)`.** Recibes un resultado (o `NaN`) en lugar de una función, y los tests fallan con "hola is not a function".
- **Recibir un solo argumento en la función nueva: `(nombre) => fn(...fijos, nombre)`.** Funciona con `saludar`, pero `parcial(sumar3, 1)(2, 3)` pierde el `3` y devuelve `NaN`.

## Otra forma de resolverlo

Con `bind`, el método nativo de las funciones:

```js
export function parcial(fn, ...fijos) {
  return fn.bind(null, ...fijos);
}
```

`bind` crea una función nueva con `this` fijado (aquí `null`, porque no lo usamos) y los primeros argumentos ya puestos. Hace exactamente lo mismo.

**¿Cuál conviene?** En la entrevista te piden implementarlo **sin** `bind` para ver que entiendes closures y rest/spread, así que escribe la primera. Después menciona `bind` como la forma nativa. **Ojo con no confundirlo con currying**: currying transforma `f(a, b, c)` en `f(a)(b)(c)`, un argumento por vez; la aplicación parcial fija varios de golpe y recibe el resto también de golpe.

## Cómo explicarlo en la entrevista

> "`parcial` recibe una función y algunos argumentos, y devuelve otra función que espera el resto. Uso rest parameters para juntar los fijos en un array y, en la función devuelta, otro rest para los que lleguen después. Al llamarla, esparzo los dos con spread, primero los fijos, y ejecuto la original. Los fijos quedan guardados en el closure, así que la función nueva se puede reutilizar. Es lo mismo que hace `bind` con sus argumentos extra."

## Conceptos

- **Aplicación parcial**: crear una función nueva fijando algunos argumentos de otra.
- **Rest parameters (`...nombre` en parámetros)**: junta los argumentos sueltos en un array.
- **Spread (`...array` en una llamada)**: esparce un array como argumentos separados.
- **Closure**: la función devuelta recuerda `fn` y `fijos`.
- **`bind`**: método de las funciones que devuelve una copia con `this` y argumentos iniciales fijados.
- **Currying**: técnica parecida, pero de un argumento por vez: `f(a)(b)(c)`.
