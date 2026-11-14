Escribe la función `evaluarRPN(tokens)` que reciba una expresión en **notación polaca inversa** (RPN, por sus siglas en inglés) como un arreglo de textos, y devuelva su resultado.

En RPN el operador va **después** de sus dos números. No hacen falta paréntesis:

- `2 + 1` se escribe `["2", "1", "+"]`.
- `(2 + 1) * 3` se escribe `["2", "1", "+", "3", "*"]`.
- `4 + (13 / 5)` se escribe `["4", "13", "5", "/", "+"]`.

## Reglas

- Los operadores son `"+"`, `"-"`, `"*"` y `"/"`. Todo lo demás es un número entero, que puede ser negativo (`"-3"`) o de varias cifras (`"13"`).
- Cada operador usa los **dos últimos** números que tienes: el primero va a la izquierda y el segundo a la derecha. `["5", "3", "-"]` es `5 - 3`, no `3 - 5`.
- La división es **entera y trunca hacia cero**: `7 / 2` da `3` y `-7 / 2` da `-3` (no `-4`).
- La expresión siempre es válida y nunca divide entre cero.

## Ejemplos

```js
evaluarRPN(["2", "1", "+", "3", "*"]);   // 9    (2 + 1) * 3
evaluarRPN(["4", "13", "5", "/", "+"]);  // 6    4 + (13 / 5) = 4 + 2
evaluarRPN(["5", "3", "-"]);             // 2
evaluarRPN(["-7", "2", "/"]);            // -3
evaluarRPN(["42"]);                      // 42
```

## Reto extra

Hazlo en **una sola pasada** con una **pila**. Es exactamente lo que hacen por dentro las calculadoras y muchos intérpretes de lenguajes.
