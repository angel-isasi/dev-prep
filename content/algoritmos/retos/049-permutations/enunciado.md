Escribe la función `permutaciones(nums)` que reciba un arreglo de números **distintos** y devuelva **todas sus permutaciones**: todas las formas de ordenar esos mismos números.

Aquí el orden **sí** importa dentro de cada permutación: `[1, 2]` y `[2, 1]` son dos permutaciones distintas.

## Reglas

- `nums` tiene entre 1 y 6 números, todos distintos. Puede haber negativos.
- Cada permutación usa **todos** los números, cada uno **una sola vez**.
- No repitas permutaciones.
- **El orden de la lista no importa**: los tests ordenan la lista de permutaciones antes de compararla (pero no tocan el orden dentro de cada una).
- No modifiques el arreglo original.

## Ejemplos

```js
permutaciones([1, 2, 3]);
// [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]   (en cualquier orden)

permutaciones([0, 1]);   // [[0, 1], [1, 0]]
permutaciones([1]);      // [[1]]
```

## Reto extra

Con n números hay n! permutaciones (n × (n - 1) × ... × 1): para el primer lugar tienes n opciones, para el segundo n - 1, y así. Resuélvelo con **backtracking**: elige un número que no hayas usado, explora, y deshaz la elección para probar el siguiente.
