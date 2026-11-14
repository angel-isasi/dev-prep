Escribe la función `ponerCeros(matriz)` que reciba una matriz de números (un arreglo de filas) y, por cada celda que valga `0`, ponga en `0` **toda su fila y toda su columna**.

Debes modificar la **misma matriz** que recibes (en el lugar) y devolverla. Así lo pide LeetCode y así lo piden en entrevistas: el reto es no gastar memoria en una copia de toda la matriz.

## Reglas

- Modifica `matriz` directamente y devuelve esa misma matriz (no una nueva).
- Solo cuentan los ceros que **ya estaban** al principio. Los ceros que tú vas poniendo no deben "contagiar" otras filas o columnas.
- La matriz tiene al menos una fila y una columna, y todas las filas tienen el mismo largo.
- No tiene por qué ser cuadrada.

## Ejemplos

```js
ponerCeros([
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
]);
// [
//   [1, 0, 1],
//   [0, 0, 0],
//   [1, 0, 1],
// ]

ponerCeros([
  [0, 1, 2, 0],
  [3, 4, 5, 2],
  [1, 3, 1, 5],
]);
// [
//   [0, 0, 0, 0],
//   [0, 4, 5, 0],
//   [0, 3, 1, 0],
// ]

const m = [[1, 0]];
ponerCeros(m);
m; // [[0, 0]]   se modificó la original
```

## Reto extra

Con dos `Set` (filas y columnas con cero) usas O(filas + columnas) de memoria. ¿Puedes hacerlo con **O(1)** de memoria extra, usando la primera fila y la primera columna de la propia matriz como libreta de apuntes?
