Escribe la función `aplicarVeces(fn, veces, valor)` que aplique la función `fn` sobre `valor` una y otra vez, `veces` veces seguidas, y devuelva el resultado final. Es decir, el resultado de cada aplicación es la entrada de la siguiente.

`aplicarVeces(fn, 3, x)` equivale a `fn(fn(fn(x)))`.

## Reglas

- Si `veces` es `0`, devuelve `valor` sin tocarlo y sin llamar a `fn`.
- `fn` se llama exactamente `veces` veces.
- `veces` siempre es un entero mayor o igual a 0.

## Ejemplos

```js
aplicarVeces((n) => n * 2, 3, 1);       // 8      -> 1 → 2 → 4 → 8
aplicarVeces((s) => s + "!", 2, "hola"); // "hola!!"
aplicarVeces((s) => s + "!", 0, "hola"); // "hola"
aplicarVeces((n) => n + 10, 1, 5);       // 15
```

## Por qué importa

Practicas el patrón "el resultado de una vuelta es la entrada de la siguiente", que está detrás de `reduce`, de la composición de funciones y de muchas simulaciones (interés compuesto, crecimiento, avanzar N turnos en un juego). Además te obliga a pensar en el caso borde de 0 repeticiones.
