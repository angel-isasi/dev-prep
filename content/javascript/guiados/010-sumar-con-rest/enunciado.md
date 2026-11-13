Escribe la función `sumarTodos(...)` que reciba **cualquier cantidad de números como argumentos sueltos** (no un array) y devuelva su suma.

## Reglas

- Puede recibir cero, uno o muchos argumentos.
- Sin argumentos, devuelve `0`.
- Los argumentos siempre son números.

## Ejemplos

```js
sumarTodos(1, 2, 3);           // 6
sumarTodos(10);                // 10
sumarTodos();                  // 0

const notas = [12, 15, 18];
sumarTodos(...notas);          // 45  (el spread "desarma" el array en argumentos)
```

## Por qué importa

Muchas funciones reales reciben una cantidad variable de argumentos: `Math.max(3, 8, 1)`, `console.log(a, b, c)`, `array.push(x, y, z)`. El **parámetro rest** (`...nombre`) te deja escribir funciones así, y su gemelo, el **spread**, te deja pasarles un array. Distinguir uno del otro es pregunta frecuente de entrevista.
