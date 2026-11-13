Escribe la función `romanoAEntero(s)` que reciba un número romano válido y devuelva su valor como número entero.

Los símbolos valen:

| Símbolo | I | V | X | L | C | D | M |
|---|---|---|---|---|---|---|---|
| Valor | 1 | 5 | 10 | 50 | 100 | 500 | 1000 |

Normalmente los símbolos van de mayor a menor y **se suman**: `LVIII` = 50 + 5 + 1 + 1 + 1 = 58. Pero si un símbolo va **antes de uno mayor**, **se resta**: `IV` = 5 - 1 = 4 y `CM` = 1000 - 100 = 900.

## Reglas

- La entrada siempre es un número romano válido entre 1 y 3999.
- Solo usa las letras `I V X L C D M`, en mayúsculas.
- Las restas posibles son seis: `IV` (4), `IX` (9), `XL` (40), `XC` (90), `CD` (400) y `CM` (900).

## Ejemplos

```js
romanoAEntero("III");       // 3
romanoAEntero("LVIII");     // 58
romanoAEntero("IX");        // 9
romanoAEntero("MCMXCIV");   // 1994  M (1000) + CM (900) + XC (90) + IV (4)
```
