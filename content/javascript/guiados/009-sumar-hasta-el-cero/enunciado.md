Escribe la función `sumarHastaCero(numeros)` que recorra un array de números y devuelva la suma de los **positivos**, con dos reglas especiales:

- Los **negativos se saltan** (no se suman, pero se sigue recorriendo).
- Al encontrar un **`0`**, se **detiene**: no se suma nada de lo que venga después.

## Reglas

- Si el array está vacío, devuelve `0`.
- Si el primer número es `0`, devuelve `0`.
- Resuélvelo con un bucle usando `continue` y `break`.

## Ejemplos

```js
sumarHastaCero([1, 2, 3]);        // 6
sumarHastaCero([5, -2, 3]);       // 8    (salta el -2)
sumarHastaCero([4, 0, 10]);       // 4    (se detiene en el 0)
sumarHastaCero([-1, 2, 0, 5]);    // 2
sumarHastaCero([]);               // 0
```

## Por qué importa

`break` y `continue` controlan el flujo de un bucle: uno lo corta y el otro salta a la siguiente vuelta. Son útiles para buscar algo y parar apenas lo encuentras (sin recorrer todo) o para ignorar datos inválidos. Y es una pregunta típica: "¿cuál es la diferencia entre `break` y `continue`?".
