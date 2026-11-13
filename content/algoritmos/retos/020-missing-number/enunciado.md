Escribe la función `faltante(nums)` que reciba un arreglo con `n` números **distintos** tomados del rango `0, 1, 2, ..., n`, y devuelva **el único número de ese rango que falta**.

Fíjate: el rango tiene `n + 1` números (del 0 al `n`), pero el arreglo solo tiene `n`. Por eso siempre falta exactamente uno.

## Reglas

- `n` es el largo del arreglo, y el arreglo tiene al menos 1 elemento.
- Los números no vienen ordenados.
- Puede faltar cualquiera, incluso el `0` o el `n`.

## Ejemplos

```js
faltante([3, 0, 1]);                     // 2   rango 0..3, falta el 2
faltante([0, 1]);                        // 2   rango 0..2, falta el último
faltante([1, 2, 3]);                     // 0   rango 0..3, falta el primero
faltante([9, 6, 4, 2, 3, 5, 7, 0, 1]);   // 8
```

## Reto extra

Ordenar y buscar el hueco es O(n log n), y usar un `Set` es O(n) pero gasta O(n) de memoria. ¿Puedes hacerlo en **O(n) de tiempo y O(1) de memoria**? Pista: piensa en cuánto deberían sumar todos los números del rango.
