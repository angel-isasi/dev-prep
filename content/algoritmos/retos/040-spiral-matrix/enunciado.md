Escribe la función `espiral(matriz)` que reciba una matriz (un arreglo de filas) y devuelva todos sus elementos en **orden de espiral**: empezando arriba a la izquierda, recorres la fila de arriba hacia la derecha, bajas por la columna derecha, vuelves por la fila de abajo hacia la izquierda, subes por la columna izquierda, y repites hacia adentro.

```
 1 → 2 → 3
         ↓
 4 → 5   6
 ↑       ↓
 7 ← 8 ← 9
```

Resultado: `[1, 2, 3, 6, 9, 8, 7, 4, 5]`.

## Reglas

- La matriz puede no ser cuadrada (por ejemplo 3 filas y 4 columnas).
- Todas las filas tienen el mismo largo.
- Cada elemento aparece **una sola vez** en el resultado.
- Si la matriz está vacía (`[]`), devuelve `[]`.

## Ejemplos

```js
espiral([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]);
// [1, 2, 3, 6, 9, 8, 7, 4, 5]

espiral([
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
]);
// [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]

espiral([[1, 2, 3]]);        // [1, 2, 3]
espiral([[1], [2], [3]]);    // [1, 2, 3]
```

## Reto extra

Lo difícil no es recorrer, sino **no repetir** elementos cuando la matriz es una sola fila, una sola columna o no es cuadrada. ¿Puedes resolverlo con cuatro límites (arriba, abajo, izquierda, derecha) que se van cerrando?
