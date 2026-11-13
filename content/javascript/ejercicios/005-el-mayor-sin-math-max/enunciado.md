Escribe la función `mayor(nums)` que reciba un arreglo de números y devuelva **el número más grande**, **sin usar `Math.max`**.

## Reglas

- Prohibido `Math.max` (tampoco `Math.max(...nums)`). La idea es que recorras el arreglo tú mismo.
- Funciona con negativos: el mayor de `[-5, -2, -9]` es `-2`.
- Si el arreglo está vacío, devuelve `undefined` (no hay mayor).
- No ordenes ni modifiques el arreglo original.

## Ejemplos

```js
mayor([3, 9, 2]);       // 9
mayor([-5, -2, -9]);    // -2
mayor([10, 1, 2]);      // 10
mayor([4]);             // 4
mayor([]);              // undefined
```

## Por qué importa

Es uno de los primeros ejercicios que dan en entrevistas para ver si sabes recorrer un arreglo guardando "el mejor hasta ahora". Ese mismo patrón sirve para el producto más caro, el alumno con mejor nota o la fecha más reciente.
