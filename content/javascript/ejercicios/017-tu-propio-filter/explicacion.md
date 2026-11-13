## Idea clave

`filter` es un bucle con un `if` dentro. La condición del `if` no la escribes tú: te la pasan como función (`cumple`). Si `cumple` responde algo verdadero, el elemento se queda; si no, se descarta. El bucle es siempre el mismo, lo que cambia es la función que le pasas.

## Paso a paso

1. **Crea un array vacío** `resultado` para los elementos que pasen el filtro.
2. **Recorre la lista** con un `for` clásico para tener el índice `i`.
3. **Pregúntale a `cumple`** por cada elemento: `cumple(lista[i], i, lista)`.
4. **Si responde algo truthy**, guarda el **elemento original** con `resultado.push(lista[i])`.
5. **Devuelve** `resultado`.

```js
export function filtrar(lista, cumple) {
  const resultado = [];

  for (let i = 0; i < lista.length; i++) {
    if (cumple(lista[i], i, lista)) {
      resultado.push(lista[i]);
    }
  }

  return resultado;
}
```

## Por qué funciona

Recorrido con `filtrar(["sol", "arena", "mar"], (p) => p.length === 3)`:

| Vuelta | `lista[i]` | `cumple(...)` | ¿Se guarda? | `resultado` |
|---|---|---|---|---|
| antes del bucle | | | | `[]` |
| 1 | `"sol"` | `3 === 3` → `true` | sí | `["sol"]` |
| 2 | `"arena"` | `5 === 3` → `false` | no | `["sol"]` |
| 3 | `"mar"` | `3 === 3` → `true` | sí | `["sol", "mar"]` |

El `if` de JavaScript no exige un booleano: convierte lo que recibe a verdadero o falso. Por eso con `filtrar([0, 1, "", "hola"], (x) => x)` se quedan `1` y `"hola"`: `0` y `""` son "falsy" y el `if` los trata como `false`. Así funciona también el `filter` nativo.

Como solo haces `push` de los que pasan, el orden se conserva y el array original nunca se toca.

## Errores comunes

- **Guardar el resultado de `cumple` en vez del elemento: `resultado.push(cumple(lista[i]))`.** Recibes un array de booleanos, por ejemplo `[true, false, true]` en vez de `["sol", "mar"]`.
- **Comparar con `=== true`: `if (cumple(x) === true)`.** Funciona con condiciones que devuelven booleanos, pero falla si `cumple` devuelve un valor truthy como `1` o `"hola"`. Lo reconoces en el test "acepta valores truthy y falsy": recibes `[]`.
- **No pasar el índice: `cumple(lista[i])`.** Con `(letra, i) => i % 2 === 0`, `i` es `undefined`, `undefined % 2` es `NaN` y nada pasa el filtro: recibes `[]` en vez de `["a", "c"]`.
- **Borrar del original con `splice` mientras recorres.** Modificas el array de quien te llamó y además te saltas elementos, porque los índices se corren.
- **Olvidar el `return`.** Todos los tests fallan con "expected undefined to deeply equal...".

## Otra forma de resolverlo

Con `for...of` y `entries()`, que te da el índice y el valor a la vez:

```js
export function filtrar(lista, cumple) {
  const resultado = [];
  for (const [i, elemento] of lista.entries()) {
    if (cumple(elemento, i, lista)) resultado.push(elemento);
  }
  return resultado;
}
```

`lista.entries()` produce pares `[indice, valor]` y la desestructuración `[i, elemento]` los separa en dos variables.

**¿Cuál conviene?** El `for` clásico es el más directo y el que cualquier entrevistador entiende al instante. La versión con `entries()` se lee un poco mejor porque nombras el elemento, pero suma un concepto más. Si el callback no necesitara el índice, un `for...of` simple sería lo más limpio.

## Cómo explicarlo en la entrevista

> "Recorro el array una vez y, por cada elemento, llamo al callback con el elemento, el índice y la lista. Si devuelve algo truthy, meto el elemento en un array nuevo; si no, lo salto. No comparo con `=== true` porque el `filter` nativo acepta cualquier valor truthy. Devuelvo el array nuevo, así que el original no cambia. Es O(n)."

## Conceptos

- **Predicado**: una función que responde sí o no sobre un valor; `cumple` es un predicado.
- **Truthy y falsy**: valores que el `if` trata como verdadero o falso. Los falsy son `false`, `0`, `""`, `null`, `undefined` y `NaN`; todo lo demás es truthy.
- **Función de orden superior**: `filtrar` recibe una función como argumento.
- **`push`**: agrega al final de un array.
- **`entries()` y desestructuración**: recorrer índice y valor juntos con `for (const [i, x] of lista.entries())`.
