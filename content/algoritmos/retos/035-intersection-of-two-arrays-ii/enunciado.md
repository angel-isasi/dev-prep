Escribe la función `interseccion(nums1, nums2)` que reciba dos arreglos de números y devuelva un arreglo con los elementos que aparecen **en los dos**.

Cada elemento aparece en el resultado **tantas veces como se repita en ambos**: si el 2 está dos veces en `nums1` y tres veces en `nums2`, va dos veces en el resultado (el mínimo de las dos cantidades).

## Reglas

- El orden del resultado **no importa** (los tests ordenan tu respuesta antes de comparar).
- Si no hay elementos en común, devuelve `[]`.
- Los arreglos pueden estar vacíos y pueden tener negativos, ceros y repetidos.
- No hace falta que conserves los arreglos originales, pero es buena práctica no modificarlos.

## Ejemplos

```js
interseccion([1, 2, 2, 1], [2, 2]);        // [2, 2]
interseccion([4, 9, 5], [9, 4, 9, 8, 4]);  // [4, 9]  (o [9, 4])
interseccion([2], [2, 2]);                 // [2]     solo hay un 2 en el primero
interseccion([1, 2], [3, 4]);              // []
```

## Reto extra

Buscar cada elemento con `indexOf` y tacharlo con `splice` es O(n · m). ¿Puedes hacerlo en **O(n + m)** contando con un `Map`? Y si los dos arreglos ya vinieran **ordenados**, ¿cómo lo harías sin memoria extra?
