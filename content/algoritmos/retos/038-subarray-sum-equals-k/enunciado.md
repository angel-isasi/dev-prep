Escribe la función `contarSubarreglos(nums, k)` que devuelva **cuántos subarreglos** de `nums` suman exactamente `k`.

Un subarreglo es un tramo de elementos **seguidos** y no vacío: en `[1, 2, 3]` los subarreglos son `[1]`, `[2]`, `[3]`, `[1, 2]`, `[2, 3]` y `[1, 2, 3]`. `[1, 3]` no lo es, porque se salta el 2.

## Reglas

- Devuelve un número: la cantidad de subarreglos, no los subarreglos.
- Dos subarreglos son distintos si empiezan o terminan en posiciones distintas, aunque tengan los mismos valores.
- Puede haber **números negativos** y ceros.
- Si el arreglo está vacío, devuelve `0`.

## Ejemplos

```js
contarSubarreglos([1, 1, 1], 2);    // 2   [1, 1] dos veces (posiciones 0-1 y 1-2)
contarSubarreglos([1, 2, 3], 3);    // 2   [1, 2] y [3]
contarSubarreglos([1, -1, 0], 0);   // 3   [1, -1], [0] y [1, -1, 0]
contarSubarreglos([], 0);           // 0
```

## Reto extra

Probar todos los subarreglos es O(n²). Como hay negativos, la ventana deslizante **no** sirve. ¿Puedes hacerlo en **una pasada**, O(n), con **sumas de prefijos** y un `Map`?
