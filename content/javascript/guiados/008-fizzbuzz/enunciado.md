Escribe la función `fizzBuzz(n)` que devuelva un array con los números del `1` al `n`, pero reemplazando:

- los múltiplos de 3 por `"Fizz"`,
- los múltiplos de 5 por `"Buzz"`,
- los múltiplos de 3 **y** de 5 a la vez por `"FizzBuzz"`.

Los demás números quedan como números (no como texto).

## Reglas

- `n` es un entero mayor o igual a 0.
- Si `n` es `0`, devuelve un array vacío.

## Ejemplos

```js
fizzBuzz(5);
// [1, 2, "Fizz", 4, "Buzz"]

fizzBuzz(15);
// [1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"]

fizzBuzz(0);
// []
```

## Por qué importa

FizzBuzz es **el** ejercicio filtro de las entrevistas: no es difícil, pero muestra si sabes usar un bucle, el operador `%` y, sobre todo, si piensas en el **orden de las condiciones**. Mucha gente lo escribe mal la primera vez por revisar el 3 antes que el 15.
