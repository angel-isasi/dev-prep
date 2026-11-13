Escribe la función `tresSuma(nums)` que reciba un arreglo de números y devuelva **todos los tríos distintos** `[a, b, c]` de elementos del arreglo (en posiciones diferentes) que **suman 0**.

## Reglas

- Cada trío usa tres posiciones distintas del arreglo, pero los valores pueden repetirse si el arreglo los tiene repetidos: `[-1, -1, 2]` es válido si hay dos `-1`.
- **No repitas tríos**: `[-1, 0, 1]` y `[0, 1, -1]` son el mismo trío y debe aparecer una sola vez.
- **El orden no importa**: ni dentro de cada trío ni entre tríos. Los tests ordenan tu resultado antes de comparar.
- Si no hay ningún trío (o hay menos de 3 números), devuelve `[]`.
- No modifiques el arreglo original.

## Ejemplos

```js
tresSuma([-1, 0, 1, 2, -1, -4]);   // [[-1, -1, 2], [-1, 0, 1]]
tresSuma([0, 0, 0, 0]);            // [[0, 0, 0]]   una sola vez
tresSuma([1, 2, -2, -1]);          // []
tresSuma([1, 2]);                  // []
```

## Reto extra

Tres bucles anidados son O(n³) y además hay que filtrar repetidos. Si **ordenas** primero, puedes fijar un número y buscar los otros dos con **dos punteros**: O(n²), sin estructuras extra para evitar duplicados.
