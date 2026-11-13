Escribe la función `parcial(fn, ...fijos)` que reciba una función y **algunos de sus primeros argumentos**, y devuelva una función nueva que espera el resto. Cuando llamas a la función nueva, se ejecuta `fn` con los argumentos fijos primero y luego los nuevos.

En otras palabras: `parcial(fn, a)(b, c)` es lo mismo que `fn(a, b, c)`.

## Reglas

- Puedes fijar cualquier cantidad de argumentos, incluso ninguno.
- Los argumentos fijos van **antes** de los que llegan después, en el mismo orden.
- La función nueva se puede usar muchas veces; los argumentos fijos no cambian entre llamadas.
- No uses `bind`.

## Ejemplos

```js
const saludar = (saludo, nombre) => `${saludo}, ${nombre}`;
const hola = parcial(saludar, "Hola");
hola("Angel");                    // "Hola, Angel"
hola("Rosa");                     // "Hola, Rosa"

const sumar3 = (a, b, c) => a + b + c;
parcial(sumar3, 1, 2)(3);         // 6
parcial(sumar3, 1)(2, 3);         // 6
parcial(sumar3)(1, 2, 3);         // 6
```

## Por qué importa

La aplicación parcial sirve para crear funciones más específicas a partir de otras generales sin repetir código: un `logError` a partir de un `log(nivel, mensaje)`, un `precioConIGV` a partir de `aplicarImpuesto(tasa, precio)`. En entrevistas aparece junto con `bind` y **currying**, y pone a prueba que manejes `...` (rest y spread).
