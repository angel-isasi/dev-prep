Escribe la función `secuenciaMasLarga(nums)` que reciba un arreglo de enteros **desordenado** y devuelva el **largo** de la secuencia de números consecutivos más larga que se puede formar con ellos.

Números consecutivos son los que van de uno en uno: `3, 4, 5, 6`. No importa en qué posición del arreglo estén: en `[100, 4, 200, 1, 3, 2]` están el 1, el 2, el 3 y el 4, aunque desordenados.

## Reglas

- Devuelve un número (el largo), no la secuencia.
- Si el arreglo está vacío, devuelve `0`.
- Los repetidos cuentan una sola vez: `[1, 2, 2, 3]` tiene la secuencia `1, 2, 3`, de largo 3.
- Puede haber negativos.

## Ejemplos

```js
secuenciaMasLarga([100, 4, 200, 1, 3, 2]);          // 4   1, 2, 3, 4
secuenciaMasLarga([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]);  // 9   0 al 8
secuenciaMasLarga([1, 2, 0, 1]);                    // 3   0, 1, 2
secuenciaMasLarga([]);                              // 0
```

## Reto extra

Ordenar el arreglo y contar tramos funciona en O(n log n). ¿Puedes hacerlo en **O(n)** con un `Set`? La clave es saber **desde qué números** vale la pena empezar a contar.
