Escribe la función `sumaOrdenada(nums, objetivo)` que reciba un arreglo de números **ordenado de menor a mayor** y devuelva los **índices** de los dos números que suman `objetivo`.

Es el mismo problema que Two Sum, pero ahora el arreglo viene ordenado, y eso cambia la estrategia: se puede resolver sin `Map`, usando memoria constante.

## Reglas

- Siempre hay **exactamente una** solución.
- No puedes usar el mismo elemento dos veces, pero sí dos valores iguales que estén en posiciones distintas.
- Devuelve `[i, j]` con `i < j`.
- Los índices empiezan en 0. (En LeetCode este problema cuenta desde 1; aquí seguimos la convención de JavaScript.)
- Puede haber números negativos, ceros y repetidos.

## Ejemplos

```js
sumaOrdenada([2, 7, 11, 15], 9);      // [0, 1]   2 + 7
sumaOrdenada([2, 3, 4], 6);           // [0, 2]   2 + 4
sumaOrdenada([-1, 0], -1);            // [0, 1]   -1 + 0
sumaOrdenada([1, 2, 3, 4, 4, 9], 8);  // [3, 4]   4 + 4
```

## Reto extra

Con un `Map`, como en Two Sum, sale en O(n) de tiempo pero O(n) de memoria. ¿Puedes aprovechar que el arreglo está ordenado para resolverlo en O(n) de tiempo y **O(1) de memoria**?
