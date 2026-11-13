Escribe la función `curry(fn)` que reciba una función de varios parámetros y devuelva una versión **"currificada"**: puedes pasarle los argumentos de a uno, de a varios o todos juntos, y `fn` solo se ejecuta cuando ya juntó **todos** los que necesita.

## Reglas

- La cantidad de argumentos que necesita `fn` es `fn.length` (el número de parámetros con que fue declarada).
- Si con lo que llevas juntado ya tienes `fn.length` argumentos o más, ejecuta `fn` y devuelve su resultado.
- Si te faltan, devuelve **otra función** que espera el resto.
- Las funciones parciales se pueden **reutilizar**: llamar a una no debe afectar a otra.

## Ejemplos

```js
const sumar3 = curry((a, b, c) => a + b + c);

sumar3(1)(2)(3);    // 6
sumar3(1, 2)(3);    // 6
sumar3(1)(2, 3);    // 6
sumar3(1, 2, 3);    // 6

const sumar10 = sumar3(4, 6);
sumar10(1);         // 11
sumar10(5);         // 15 (sumar10 se puede usar muchas veces)
```

## Por qué importa

El currying permite crear funciones especializadas a partir de una general, como `const precioConIGV = multiplicar(1.18)`. Aparece en librerías funcionales como Ramda y en patrones de React (manejadores como `onClick={seleccionar(id)}`). En entrevistas es un ejercicio de nivel alto para medir closures, recursión y `fn.length` a la vez.
