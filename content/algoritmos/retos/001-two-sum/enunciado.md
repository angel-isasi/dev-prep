Escribe la función `twoSum(nums, objetivo)` que reciba un arreglo de números y un número objetivo, y devuelva los **índices** de los dos números que suman el objetivo.

## Reglas

- Siempre hay exactamente una solución.
- No puedes usar el mismo elemento dos veces (el mismo índice), pero sí dos elementos con el mismo valor.
- Devuelve los índices en orden: el menor primero, `[i, j]` con `i < j`.
- Puede haber números negativos y ceros.

## Ejemplos

```js
twoSum([2, 7, 11, 15], 9);   // [0, 1]  porque 2 + 7 = 9
twoSum([3, 2, 4], 6);        // [1, 2]  porque 2 + 4 = 6
twoSum([3, 3], 6);           // [0, 1]
```

## Reto extra

La solución con dos bucles anidados funciona, pero es O(n²). ¿Puedes resolverlo recorriendo el arreglo **una sola vez**? Es la pregunta de seguimiento que casi siempre hace el entrevistador.
