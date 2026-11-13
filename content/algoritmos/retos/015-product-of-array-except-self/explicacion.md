## Idea clave

"El producto de todos menos yo" es **lo que está a mi izquierda multiplicado por lo que está a mi derecha**. Una pasada de izquierda a derecha calcula el producto de la izquierda de cada posición; otra de derecha a izquierda lo multiplica por el producto de la derecha. Sin dividir y en O(n).

## Paso a paso

1. **La solución directa** (dila en voz alta): para cada posición, multiplica todos los demás con un bucle interno. Es O(n²).

   ```js
   return nums.map((_, i) => {
     let producto = 1;
     for (let j = 0; j < nums.length; j++) {
       if (j !== i) producto *= nums[j];
     }
     return producto;
   });
   ```

2. **El truco prohibido**: multiplicar todo y dividir entre `nums[i]`. Es O(n), pero el enunciado no deja usar división, y además falla con ceros: con `[0, 4, 5]` el total es 0 y `0 / 0` da `NaN`.
3. **Parte el problema en dos.** Para la posición `i`: `resultado[i] = (producto de nums[0..i-1]) * (producto de nums[i+1..n-1])`. Son un **prefijo** y un **sufijo**.
4. **Primera pasada (prefijos).** Recorre de izquierda a derecha con un acumulado `izquierda = 1`. En cada posición **primero** guardas `resultado[i] = izquierda` (el producto de lo anterior, sin incluir `nums[i]`) y **después** actualizas `izquierda *= nums[i]`.
5. **Segunda pasada (sufijos).** Recorre de derecha a izquierda con `derecha = 1`. Primero `resultado[i] *= derecha`, después `derecha *= nums[i]`.
6. **Memoria**: aparte del arreglo de salida, solo usas dos números. Por eso se dice O(1) de memoria extra.

```js
export function productoExceptoYo(nums) {
  const resultado = new Array(nums.length).fill(1);

  let izquierda = 1;
  for (let i = 0; i < nums.length; i++) {
    resultado[i] = izquierda;
    izquierda *= nums[i];
  }

  let derecha = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    resultado[i] *= derecha;
    derecha *= nums[i];
  }

  return resultado;
}
```

## Por qué funciona

Recorrido con `productoExceptoYo([1, 2, 3, 4])`.

**Pasada 1** (de izquierda a derecha):

| `i` | `nums[i]` | `resultado[i] = izquierda` | `izquierda` después |
|---|---|---|---|
| 0 | 1 | 1 (no hay nada a la izquierda) | 1 |
| 1 | 2 | 1 | 2 |
| 2 | 3 | 2 (1 * 2) | 6 |
| 3 | 4 | 6 (1 * 2 * 3) | 24 |

`resultado` queda `[1, 1, 2, 6]`: el producto de la izquierda de cada posición.

**Pasada 2** (de derecha a izquierda):

| `i` | `nums[i]` | `resultado[i] *= derecha` | `derecha` después |
|---|---|---|---|
| 3 | 4 | 6 * 1 = **6** | 4 |
| 2 | 3 | 2 * 4 = **8** | 12 |
| 1 | 2 | 1 * 12 = **12** | 24 |
| 0 | 1 | 1 * 24 = **24** | 24 |

Resultado final: `[24, 12, 8, 6]`.

Con `[0, 4, 5]`: la pasada 1 da `[1, 0, 0]` y la pasada 2 multiplica por `20, 5, 1` respectivamente, dando `[20, 0, 0]`. Los ceros no causan ningún problema porque nunca se divide.

## Errores comunes

- **Dividir el total entre `nums[i]`.** Además de estar prohibido, con un cero da `NaN` o `Infinity`. Lo reconoces en el test `[0, 4, 5]`.
- **Actualizar el acumulado antes de guardarlo.** Si en la primera pasada haces `izquierda *= nums[i]` primero, `resultado[i]` incluye a `nums[i]`, que es justo lo que había que excluir. Con `[1, 2, 3, 4]` obtendrías `[24, 24, 24, 24]`.
- **Empezar los acumulados en 0.** Todo producto da 0. El elemento neutro de la multiplicación es 1.
- **En la segunda pasada, asignar (`=`) en vez de multiplicar (`*=`).** Pierdes el producto de la izquierda y te queda solo el de la derecha.
- **Comparar resultados con `-0`.** `0 * -3` es `-0` en JavaScript; `toEqual` lo distingue de `0`. No es un error de tu algoritmo: por eso los tests normalizan con `x + 0`.

## Otra forma de resolverlo

**Dos bucles** (paso 1): O(n²) de tiempo, O(1) de memoria extra. Correcta y fácil, pero lenta.

**Arreglos de prefijos y sufijos separados**: calculas `prefijos[i]` y `sufijos[i]` en dos arreglos y luego `resultado[i] = prefijos[i] * sufijos[i]`. Es la misma idea, más fácil de visualizar, pero usa O(n) de memoria extra. La solución oficial ahorra esos arreglos reutilizando `resultado` y una sola variable.

**¿Cuál conviene?** Si te cuesta, escribe primero la de dos arreglos de prefijos y sufijos; después muestra cómo se comprime a la versión con dos variables. Es exactamente la conversación que busca el entrevistador.

## Cómo explicarlo en la entrevista

> "La solución directa es multiplicar todos los demás para cada posición, que es O(n²), y no puedo dividir, que además fallaría con ceros. Me doy cuenta de que el producto de todos menos yo es el producto de lo que está a mi izquierda por lo que está a mi derecha. Hago una pasada de izquierda a derecha guardando en el resultado el producto acumulado de la izquierda, y otra de derecha a izquierda multiplicando por el acumulado de la derecha. Queda O(n) de tiempo y O(1) de memoria extra sin contar el arreglo de salida."

## Conceptos

- **Prefijos y sufijos acumulados**: precalcular productos (o sumas) de "todo lo anterior" y "todo lo posterior".
- **Elemento neutro**: 1 para multiplicar, 0 para sumar; es el valor inicial de un acumulado.
- **Orden de actualización**: usar el acumulado antes de incluir el elemento actual.
- **`-0` en JavaScript**: existe y `Object.is(0, -0)` es `false`, aunque `0 === -0` es `true`.
- **Memoria extra vs salida**: el arreglo que devuelves no cuenta como memoria extra.
