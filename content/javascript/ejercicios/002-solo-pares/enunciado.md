Escribe la función `soloPares(nums)` que reciba un arreglo de números enteros y devuelva un **arreglo nuevo** solo con los números pares, en el mismo orden en que aparecen.

## Reglas

- Un número es par si al dividirlo entre 2 el residuo es 0. El **cero es par**, y los negativos también pueden serlo (`-4` es par).
- **No modifiques el arreglo original.**
- Si no hay ningún par, o el arreglo está vacío, devuelve `[]`.

## Ejemplos

```js
soloPares([1, 2, 3, 4, 10]);   // [2, 4, 10]
soloPares([-4, -3, 0, 7]);     // [-4, 0]
soloPares([1, 3, 5]);          // []
soloPares([]);                 // []
```

## Por qué importa

Quedarte con los elementos que cumplen una condición es el día a día del frontend: productos en stock, tareas pendientes, resultados de un buscador. Y el operador `%` aparece en muchos ejercicios de entrevista (FizzBuzz, alternar colores en filas, etc.).
