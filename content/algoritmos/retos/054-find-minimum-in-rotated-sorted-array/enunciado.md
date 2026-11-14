Escribe la función `minimoRotado(nums)` que reciba un arreglo **ordenado de menor a mayor que fue rotado** y devuelva su **valor mínimo**.

Rotar es tomar un tramo del final y pasarlo al inicio. Por ejemplo, `[0, 1, 2, 4, 5, 6, 7]` rotado 3 veces queda `[5, 6, 7, 0, 1, 2, 4]`. Puede estar rotado 0 veces (sigue ordenado) o tantas veces como su largo.

## Reglas

- El arreglo tiene al menos un elemento.
- Todos los valores son **distintos**.
- Puede haber números negativos.
- Devuelve el valor mínimo, no su posición.

## Ejemplos

```js
minimoRotado([3, 4, 5, 1, 2]);          // 1
minimoRotado([4, 5, 6, 7, 0, 1, 2]);    // 0
minimoRotado([11, 13, 15, 17]);         // 11   no está rotado
minimoRotado([2, 1]);                   // 1
```

## Reto extra

`Math.min(...nums)` o un recorrido completo es O(n). Aprovecha que cada mitad del arreglo sigue "casi ordenada" y resuélvelo con **búsqueda binaria** en **O(log n)**.
