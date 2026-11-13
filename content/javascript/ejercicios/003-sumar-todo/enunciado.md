Escribe la función `sumar(nums)` que reciba un arreglo de números y devuelva **la suma de todos**.

## Reglas

- Si el arreglo está vacío, la suma es `0` (no `undefined` ni un error).
- Funciona con negativos.
- No modifiques el arreglo original.

## Ejemplos

```js
sumar([5, 10, 15]);    // 30
sumar([-5, 10, -3]);   // 2
sumar([7]);            // 7
sumar([]);             // 0
```

## Por qué importa

Sumar con un acumulador es el patrón base de muchos problemas: el total de un carrito de compras, el promedio de notas, contar elementos. Es también el ejemplo clásico para mostrar que entiendes `reduce`, que siempre aparece en entrevistas.
