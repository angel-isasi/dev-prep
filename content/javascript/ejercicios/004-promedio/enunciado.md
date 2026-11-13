Escribe la función `promedio(nums)` que reciba un arreglo de números y devuelva su **promedio**: la suma de todos dividida entre la cantidad de elementos.

## Reglas

- Si el arreglo está vacío, devuelve `0`. No devuelvas `NaN`.
- El resultado puede tener decimales: no lo redondees.
- Funciona con negativos.
- No modifiques el arreglo original.

## Ejemplos

```js
promedio([12, 15, 18]);   // 15
promedio([1, 2]);         // 1.5
promedio([-4, 4, 6]);     // 2
promedio([17]);           // 17
promedio([]);             // 0
```

## Por qué importa

El caso del arreglo vacío es una trampa clásica: una división entre cero en JavaScript no lanza error, devuelve `NaN` en silencio, y ese `NaN` termina mostrándose en pantalla. En entrevistas se fijan mucho en si pensaste en los casos borde antes de escribir código.
