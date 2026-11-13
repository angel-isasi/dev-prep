Escribe la función `duplicar(nums)` que reciba un arreglo de números y devuelva un **arreglo nuevo** con cada número multiplicado por dos.

## Reglas

- El resultado tiene la misma cantidad de elementos y en el mismo orden.
- **No modifiques el arreglo original**: quien llama a tu función espera que `nums` siga igual después.
- Si el arreglo está vacío, devuelve un arreglo vacío `[]`.
- Funciona con negativos y con cero.

## Ejemplos

```js
duplicar([1, 2, 3]);     // [2, 4, 6]
duplicar([-1, 0, 5]);    // [-2, 0, 10]
duplicar([]);            // []

const notas = [10, 12];
duplicar(notas);         // [20, 24]
notas;                   // [10, 12]  (sigue igual)
```

## Por qué importa

"Transformar cada elemento de una lista" es lo que más harás en frontend: precios con descuento, nombres en mayúsculas, datos de una API convertidos en tarjetas. En React, pintar una lista es justamente un `map`.
