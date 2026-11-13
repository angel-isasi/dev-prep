## Idea clave

Puedes construir funciones nuevas a partir de otras sin reescribirlas. `negar` envuelve al predicado: la función que devuelve le pasa los mismos argumentos a `cumple` y le da la vuelta a la respuesta con `!`.

## Paso a paso

1. **Recibe el predicado** `cumple`.
2. **Devuelve una función nueva** que recibe todos sus argumentos con `(...args)`.
3. **Llama a `cumple(...args)`** para obtener la respuesta original.
4. **Inviértela con `!`** y devuelve el resultado.

```js
export function negar(cumple) {
  return (...args) => !cumple(...args);
}
```

## Por qué funciona

Recorrido con `[1, 2, 3, 4].filter(negar(esPar))`. Primero, `negar(esPar)` devuelve una función; `filter` la llama con cada número:

| `n` | `esPar(n)` | `!esPar(n)` | ¿`filter` lo deja? |
|---|---|---|---|
| `1` | `false` | `true` | sí |
| `2` | `true` | `false` | no |
| `3` | `false` | `true` | sí |
| `4` | `true` | `false` | no |

Resultado: `[1, 3]`.

**¿Qué queda recordado?** La función devuelta recuerda `cumple` gracias al closure: por eso, aunque `negar` ya terminó, cada vez que `filter` la llama sabe a quién preguntarle.

**¿Por qué `!` y no otra cosa?** El operador `!` convierte cualquier valor a booleano y lo invierte: `!""` es `true`, `!"hola"` es `false`, `!0` es `true`. Así la función negada siempre devuelve `true` o `false`, aunque el predicado devuelva otro tipo de valor.

**¿Por qué `...args`?** `filter` le pasa al callback tres argumentos (elemento, índice, array), y otros predicados pueden necesitar dos, como `esMayor(a, b)`. Con `...args` reenvías todos, sean cuantos sean.

## Errores comunes

- **Devolver un valor en vez de una función: `return !cumple`.** `!` aplicado a una función da `false` (las funciones son truthy). `filter(false)` lanza "TypeError: false is not a function".
- **Recibir un solo argumento: `(x) => !cumple(x)`.** Funciona con `esPar`, pero pierdes el segundo argumento de `esMayor(a, b)`: `b` llega como `undefined`, `5 > undefined` es `false` y la negación da `true`. El test "pasa todos los argumentos" falla.
- **Olvidar llamar a `cumple`: `(...args) => !cumple`.** Siempre devuelve `false`. Recibes `[]` en vez de `[1, 3]`.
- **Comparar con `=== false`: `(...args) => cumple(...args) === false`.** Funciona solo si el predicado devuelve booleanos. Con `identidad("")` devuelve `false` en vez de `true`, porque `""` no es exactamente `false`.

## Otra forma de resolverlo

Con `function` y sin rest parameters, usando el objeto `arguments`:

```js
export function negar(cumple) {
  return function () {
    return !cumple(...arguments);
  };
}
```

`arguments` es un objeto especial, parecido a un array, que existe dentro de las funciones normales (no en las arrow functions) y contiene todos los argumentos recibidos.

**¿Cuál conviene?** La versión con `...args` es la moderna y la que deberías escribir. `arguments` aparece en código antiguo, y saber que no existe en arrow functions es un detalle que a veces preguntan.

## Cómo explicarlo en la entrevista

> "`negar` es una función de orden superior: recibe un predicado y devuelve otro que responde lo contrario. La función devuelta recoge todos los argumentos con rest, se los pasa al predicado original con spread y niega el resultado con `!`, que además garantiza un booleano. Gracias al closure recuerda el predicado. Así puedo hacer `filter(negar(esPar))` sin escribir una función `esImpar` aparte."

## Conceptos

- **Predicado**: función que responde sí o no (`true` o `false`) sobre sus argumentos.
- **Operador `!`**: convierte a booleano e invierte; `!!x` convierte a booleano sin invertir.
- **Función de orden superior**: recibe una función y devuelve otra.
- **Rest y spread (`...args`)**: juntar todos los argumentos y reenviarlos.
- **Closure**: la función devuelta recuerda `cumple`.
- **`arguments`**: objeto con todos los argumentos dentro de una `function` normal; no existe en arrow functions.
