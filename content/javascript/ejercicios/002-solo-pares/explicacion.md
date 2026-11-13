## Idea clave

`filter` recorre el arreglo y se queda **solo con los elementos para los que tu función devuelve `true`**. Para saber si un número es par, miras el residuo de dividirlo entre 2: `n % 2 === 0`.

## Paso a paso

1. **Define la condición de "par"**: `n % 2 === 0`. El operador `%` (módulo) devuelve el residuo de la división.
2. **Pásasela a `filter`** como una función flecha. `filter` la ejecuta con cada elemento.
3. **`filter` arma un arreglo nuevo** con los elementos que dieron `true`, en el mismo orden. Los que dieron `false` se descartan.
4. **Devuelve ese arreglo**.

```js
export function soloPares(nums) {
  return nums.filter((n) => n % 2 === 0);
}
```

## Por qué funciona

Recorrido con `soloPares([1, 2, 3, 4, 10])`:

| `n` | `n % 2` | `n % 2 === 0` | ¿Se queda? |
|---|---|---|---|
| `1` | `1` | `false` | no |
| `2` | `0` | `true` | sí |
| `3` | `1` | `false` | no |
| `4` | `0` | `true` | sí |
| `10` | `0` | `true` | sí |

Resultado: `[2, 4, 10]`.

Con negativos: `-4 % 2` es `0` (par) y `-3 % 2` es **`-1`**, no `1`. En JavaScript el residuo conserva el signo del número que divides. Por eso comparar con `0` funciona siempre, y comparar con `1` no.

`0 % 2` es `0`, así que el cero cuenta como par.

## Errores comunes

- **Escribir la condición como "no es impar": `n % 2 !== 1`.** Parece lo mismo, pero `-3 % 2` es `-1`, que es distinto de `1`, así que `-3` se cuela como par. Lo reconoces porque el test "el cero y los negativos pares también cuentan" recibe `[-4, -3, 0]`.
- **Usar `map` en vez de `filter`**: `nums.map((n) => n % 2 === 0)`. Recibes un arreglo de booleanos, como `[false, true, false, true, true]`.
- **Usar `=` en vez de `===`**: `n % 2 = 0` es un error de sintaxis (no puedes asignarle a una operación). El archivo no corre y la app muestra el error.
- **Poner llaves sin `return`**: `nums.filter((n) => { n % 2 === 0 })`. La función devuelve `undefined`, que cuenta como falso, y recibes `[]` en todos los tests.
- **Borrar elementos del original con `splice`** dentro de un bucle. Además de modificar `nums` (falla "no modifica el arreglo original"), al borrar se corren los índices y te saltas elementos.

## Otra forma de resolverlo

Con un bucle y un arreglo nuevo:

```js
export function soloPares(nums) {
  const pares = [];
  for (const n of nums) {
    if (n % 2 === 0) {
      pares.push(n);
    }
  }
  return pares;
}
```

**¿Cuál conviene?** `filter` es más corto y comunica la intención ("me quedo con algunos"). El bucle muestra lo que pasa por dentro y te sirve si te piden no usar métodos de array. Ambas recorren la lista una vez.

## Cómo explicarlo en la entrevista

> "Como solo tengo que quedarme con algunos elementos, uso `filter`. La condición de par es que el residuo entre 2 sea cero, `n % 2 === 0`. Comparo con cero y no con uno a propósito, porque en JavaScript el residuo de un negativo es negativo: `-3 % 2` da `-1`. `filter` devuelve un arreglo nuevo, así que no modifico el original. Es O(n) porque recorro una sola vez."

## Conceptos

- **`filter`**: devuelve un arreglo nuevo con los elementos que cumplen la condición.
- **Operador `%` (módulo)**: devuelve el residuo de una división entera; conserva el signo del dividendo.
- **`===` (igualdad estricta)**: compara valor y tipo sin conversiones; úsalo siempre en vez de `==`.
- **Valores "truthy" y "falsy"**: `filter` trata `undefined`, `0`, `""` y `null` como falso.
- **Función flecha con retorno implícito**: sin llaves, devuelve la expresión directamente.
