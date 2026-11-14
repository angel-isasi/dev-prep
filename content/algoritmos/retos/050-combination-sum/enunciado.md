Escribe la función `combinacionesQueSuman(candidatos, objetivo)` que reciba un arreglo de números enteros positivos **distintos** y un `objetivo`, y devuelva **todas las combinaciones** de candidatos que **suman exactamente** el objetivo.

Cada candidato se puede usar **las veces que quieras**. Piénsalo como pagar un monto exacto con monedas de ciertos valores: con monedas de 2 y 3 puedes pagar 7 como 2 + 2 + 3.

## Reglas

- Los candidatos son enteros positivos y distintos. El objetivo es un entero positivo.
- Un mismo candidato puede aparecer varias veces en una combinación.
- Dos combinaciones con los mismos números en otro orden son **la misma**: `[2, 2, 3]` y `[3, 2, 2]` cuentan una sola vez.
- Si no hay ninguna combinación, devuelve `[]`.
- **El orden no importa**, ni el de la lista ni el de los números dentro de cada combinación: los tests ordenan tu respuesta antes de compararla.
- No modifiques el arreglo original.

## Ejemplos

```js
combinacionesQueSuman([2, 3, 6, 7], 7);
// [[2, 2, 3], [7]]

combinacionesQueSuman([2, 3, 5], 8);
// [[2, 2, 2, 2], [2, 3, 3], [3, 5]]

combinacionesQueSuman([2], 1);   // []        con 2 no se llega a 1
combinacionesQueSuman([1], 2);   // [[1, 1]]
```

## Reto extra

Resuélvelo con **backtracking** sin generar repetidos como `[2, 3]` y `[3, 2]`. El truco está en **desde qué candidato** dejas seguir eligiendo después de cada elección. Y si ordenas los candidatos, puedes cortar ramas antes de tiempo.
