Escribe la función `subsecuenciaCreciente(nums)` que reciba un arreglo de números y devuelva el **largo** de la **subsecuencia estrictamente creciente** más larga.

Una subsecuencia se forma **borrando** algunos elementos (o ninguno) sin cambiar el orden de los que quedan. A diferencia de una subcadena, **no** tiene que ser un tramo seguido: en `[10, 9, 2, 5, 3, 7, 101, 18]`, `[2, 3, 7, 101]` es una subsecuencia válida aunque se salta el 5.

## Reglas

- "Estrictamente creciente" significa que cada número es **mayor** que el anterior: `[3, 3]` no es creciente.
- Devuelve el largo (un número), no la subsecuencia.
- Si el arreglo está vacío, devuelve `0`.
- No modifiques el arreglo que recibes.

## Ejemplos

```js
subsecuenciaCreciente([10, 9, 2, 5, 3, 7, 101, 18]);  // 4   por ejemplo [2, 3, 7, 101]
subsecuenciaCreciente([0, 1, 0, 3, 2, 3]);            // 4   [0, 1, 2, 3]
subsecuenciaCreciente([7, 7, 7, 7]);                  // 1   los iguales no cuentan como crecer
subsecuenciaCreciente([]);                            // 0
```

## Reto extra

Probar todas las subsecuencias es O(2ⁿ). Con programación dinámica se resuelve en **O(n²)**: para cada posición, calcula la subsecuencia creciente más larga que **termina** ahí.
