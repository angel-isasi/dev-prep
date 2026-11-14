Escribe la función `buscarEnRotado(nums, objetivo)` que reciba un arreglo **ordenado de menor a mayor que fue rotado** y un número `objetivo`, y devuelva la **posición** del objetivo en el arreglo, o `-1` si no está.

Rotar es tomar un tramo del final y pasarlo al inicio. Por ejemplo, `[0, 1, 2, 4, 5, 6, 7]` rotado queda `[4, 5, 6, 7, 0, 1, 2]`. Puede estar rotado 0 veces (sigue ordenado).

## Reglas

- Todos los valores son **distintos**.
- El arreglo puede estar vacío o tener un solo elemento.
- Devuelve el índice (la posición), no el valor.
- La gracia del problema es hacerlo en **O(log n)**: `indexOf` o un recorrido completo resuelven los tests, pero no la entrevista.

## Ejemplos

```js
buscarEnRotado([4, 5, 6, 7, 0, 1, 2], 0);   // 4
buscarEnRotado([4, 5, 6, 7, 0, 1, 2], 3);   // -1
buscarEnRotado([1], 0);                     // -1
buscarEnRotado([3, 1], 1);                  // 1
```

## Reto extra

Si cortas un arreglo rotado por la mitad, **al menos una de las dos mitades está ordenada**. Usa eso para decidir, en cada paso de la búsqueda binaria, qué mitad descartar.
