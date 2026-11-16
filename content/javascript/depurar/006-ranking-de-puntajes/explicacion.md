## Idea clave

`sort()` sin comparador **convierte los elementos a texto** y los ordena letra por letra, como en un diccionario. Para textos, `"100"` va antes que `"45"` (porque `"1"` < `"4"`) y `"9"` va después de `"80"`. Con números de la misma cantidad de cifras el orden de texto coincide con el numérico, por eso a veces "funciona".

## Paso a paso

1. **Lee el síntoma.** Falla solo cuando se mezclan cantidades de cifras distintas. Esa pista es casi una firma de este error.
2. **Reprodúcelo en la consola.** `[80, 100, 9, 45].sort()` da `[100, 45, 80, 9]`. Con `reverse`, `[9, 80, 45, 100]`, y el top 3 es `[9, 80, 45]`.
3. **Aísla el método.** El `slice` y el `reverse` hacen lo que dicen; el orden ya viene mal desde `sort`.
4. **Pasa un comparador numérico.** `b - a` ordena de mayor a menor, así que el `reverse` sobra.

```js
return [...puntajes].sort((a, b) => b - a).slice(0, n);
```

## Por qué funciona

`sort` llama al comparador con dos elementos y mira el signo del resultado:

| `(a, b) => b - a` | Resultado | Qué hace `sort` |
|---|---|---|
| `a = 9`, `b = 100` | `91` (positivo) | pone `b` (100) antes |
| `a = 100`, `b = 80` | `-20` (negativo) | deja `a` (100) antes |
| `a = 45`, `b = 45` | `0` | los deja como estaban |

Así compara **números**, no textos. Orden final: `[100, 80, 45, 9]`, y `slice(0, 3)` da `[100, 80, 45]`.

La copia `[...puntajes]` ya estaba bien: evita que `sort` modifique el arreglo original.

## Errores comunes

- **Quitar el `reverse` sin poner comparador.** Sale `[100, 45, 80]`: sigue siendo orden de texto.
- **Usar un comparador que devuelve booleanos**: `sort((a, b) => a < b)`. `sort` espera un número negativo, cero o positivo; con `true` y `false` el orden es impredecible según el navegador.
- **Rellenar con ceros** (`"009"`, `"080"`) para que el texto se ordene bien. Funciona con un máximo fijo de cifras, pero es un parche: la causa es que `sort` no sabe que son números.

## Otra forma de resolverlo

Ordenar de menor a mayor y tomar los últimos `n`, invertidos:

```js
export function mejoresPuntajes(puntajes, n) {
  return [...puntajes].sort((a, b) => a - b).slice(-n).reverse();
}
```

O usar `toSorted((a, b) => b - a)`, que no necesita la copia porque ya devuelve un arreglo nuevo.

## Cómo explicarlo en la entrevista

> "Funcionaba con números de dos cifras y fallaba al mezclar cifras, lo que es típico de `sort` sin comparador: convierte todo a texto y ordena como diccionario, así que `"100"` queda antes de `"45"`. Le pasé `(a, b) => b - a` para comparar números de mayor a menor, y así ya no necesito el `reverse`. Con números, nunca uso `sort` sin comparador."

## Conceptos

- **Orden por defecto de `sort`**: convierte a texto y compara por código de cada carácter.
- **Función comparadora**: `(a, b) => número`. Negativo: `a` primero; positivo: `b` primero; cero: sin cambio.
- **`a - b` y `b - a`**: orden ascendente y descendente para números.
- **`slice(0, n)`**: los primeros `n` elementos, sin modificar el arreglo.
- **`toSorted`**: versión de `sort` que devuelve un arreglo nuevo.
