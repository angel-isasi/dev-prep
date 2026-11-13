Escribe la función `contarIslas(grilla)` que reciba una grilla (un arreglo de filas) donde `"1"` es tierra y `"0"` es agua, y devuelva **cuántas islas** hay.

Una isla es un grupo de celdas de tierra conectadas **en horizontal o en vertical** (arriba, abajo, izquierda, derecha). Las diagonales **no** conectan. Todo lo que está fuera de la grilla es agua.

## Reglas

- Las celdas son textos: `"1"` y `"0"`, no números.
- Todas las filas tienen el mismo largo.
- La grilla puede estar vacía (`[]`): devuelve 0.
- **No modifiques la grilla que recibes.**

## Ejemplos

```js
contarIslas([
  ["1", "1", "0", "0", "0"],
  ["1", "1", "0", "0", "0"],
  ["0", "0", "1", "0", "0"],
  ["0", "0", "0", "1", "1"],
]); // 3   el bloque de arriba a la izquierda, el 1 del centro y la pareja de abajo

contarIslas([
  ["1", "0"],
  ["0", "1"],
]); // 2   en diagonal no se tocan

contarIslas([["0"]]); // 0
```

## Reto extra

Visita cada celda un número constante de veces: **O(filas × columnas)**. Y si la grilla fuera enorme, ¿cómo lo harías sin recursión para no desbordar la pila?
