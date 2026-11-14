Escribe la función `generarParentesis(n)` que reciba un número `n` y devuelva **todas** las combinaciones de `n` pares de paréntesis que estén **bien formadas**.

Bien formada significa que cada `(` se cierra con un `)` que viene después, y que nunca se cierra algo que no se abrió: `"(())"` y `"()()"` valen, pero `"())("` no.

## Reglas

- `n` es un entero entre 1 y 8.
- Cada combinación es un texto de largo `2 * n`.
- No repitas combinaciones.
- **El orden del resultado no importa**: los tests ordenan tu respuesta antes de compararla.

## Ejemplos

```js
generarParentesis(1);   // ["()"]
generarParentesis(2);   // ["(())", "()()"]
generarParentesis(3);   // ["((()))", "(()())", "(())()", "()(())", "()()()"]
```

## Reto extra

Generar todos los textos posibles de `(` y `)` y filtrar los válidos funciona, pero son 2²ⁿ textos. Con **backtracking** construyes solo los que pueden terminar bien: cada vez que agregas un carácter, compruebas que todavía tenga sentido seguir.
