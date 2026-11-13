Escribe la función `busquedaBinaria(nums, objetivo)` que reciba un arreglo de números **ordenado de menor a mayor** y un número `objetivo`, y devuelva el **índice** donde está el objetivo, o `-1` si no está.

## Reglas

- El arreglo está ordenado de menor a mayor y no tiene repetidos.
- Puede estar vacío.
- Puede haber números negativos.
- No uses `indexOf`, `includes` ni `findIndex`: la gracia es aprovechar que está ordenado.

## Ejemplos

```js
busquedaBinaria([-1, 0, 3, 5, 9, 12], 9);   // 4
busquedaBinaria([-1, 0, 3, 5, 9, 12], 2);   // -1
busquedaBinaria([5], 5);                    // 0
busquedaBinaria([], 1);                     // -1
```

## Reto extra

Recorrer el arreglo de inicio a fin es O(n). Como está ordenado, puedes descartar **la mitad** de los elementos en cada paso: O(log n). Con un millón de elementos, eso son unas 20 comparaciones en lugar de un millón.
