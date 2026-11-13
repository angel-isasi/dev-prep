Escribe la función `posicionInsertar(nums, objetivo)` que reciba un arreglo **ordenado de menor a mayor** y sin repetidos, y un número `objetivo`. Si el objetivo está, devuelve su **índice**. Si no está, devuelve el índice donde **debería insertarse** para que el arreglo siga ordenado.

## Reglas

- El arreglo está ordenado de menor a mayor y no tiene repetidos.
- Puede estar vacío: en ese caso la respuesta es 0.
- Si el objetivo es mayor que todos, va al final: el índice es `nums.length`.
- No uses `indexOf`, `findIndex` ni recorras todo el arreglo: aprovecha el orden.

## Ejemplos

```js
posicionInsertar([1, 3, 5, 6], 5);   // 2   está en el índice 2
posicionInsertar([1, 3, 5, 6], 2);   // 1   iría entre el 1 y el 3
posicionInsertar([1, 3, 5, 6], 7);   // 4   al final
posicionInsertar([1, 3, 5, 6], 0);   // 0   al inicio
posicionInsertar([], 3);             // 0
```

## Reto extra

Un recorrido lineal es O(n). Con **búsqueda binaria** se hace en O(log n). Es la misma búsqueda binaria de siempre, pero en vez de devolver -1 cuando no encuentras el valor, tienes que devolver **dónde se quedaron los punteros**.
