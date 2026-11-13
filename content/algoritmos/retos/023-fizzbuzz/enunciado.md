Escribe la función `fizzBuzz(n)` que devuelva un arreglo de **textos** con los números del 1 al `n`, pero reemplazando:

- los múltiplos de 3 por `"Fizz"`,
- los múltiplos de 5 por `"Buzz"`,
- los múltiplos de 3 **y** de 5 (o sea, de 15) por `"FizzBuzz"`.

Los demás números van como texto: `"1"`, no `1`.

## Reglas

- `n` es un entero mayor o igual a 0.
- Si `n` es 0, devuelve `[]`.
- La posición `0` del arreglo corresponde al número 1, la posición `14` al número 15, etc.
- Todos los elementos son strings.

## Ejemplos

```js
fizzBuzz(5);    // ["1", "2", "Fizz", "4", "Buzz"]
fizzBuzz(15);   // [..., "13", "14", "FizzBuzz"]
fizzBuzz(1);    // ["1"]
```

## Reto extra

Escríbelo de forma que, si mañana te piden agregar `"Bazz"` para los múltiplos de 7, solo tengas que agregar **una línea**, sin escribir casos como `"FizzBazz"` o `"FizzBuzzBazz"` a mano.
