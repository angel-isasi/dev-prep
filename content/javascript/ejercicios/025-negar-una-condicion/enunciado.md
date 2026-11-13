Escribe la función `negar(cumple)` que reciba una función que responde verdadero o falso (un **predicado**) y devuelva una función nueva que responde **lo contrario**.

Si `cumple(x)` es `true`, entonces `negar(cumple)(x)` es `false`, y al revés.

## Reglas

- La función devuelta siempre devuelve un booleano (`true` o `false`).
- Debe pasarle a `cumple` **todos** los argumentos que reciba, no solo el primero.
- No modifiques la función original: `cumple` debe seguir funcionando igual.

## Ejemplos

```js
const esPar = (n) => n % 2 === 0;
const esImpar = negar(esPar);
esImpar(3);                          // true
esImpar(4);                          // false

[1, 2, 3, 4].filter(negar(esPar));   // [1, 3]

const esMayor = (a, b) => a > b;
negar(esMayor)(5, 2);                // false

negar((x) => x)("");                 // true  ("" es falsy)
```

## Por qué importa

Te enseña a **construir funciones nuevas a partir de otras** sin reescribirlas: en vez de escribir `esImpar`, `noEstaVacio` o `noEsAdmin` a mano, los sacas de las funciones que ya tienes. Es muy útil con `filter` y es una pregunta corta típica para ver si entiendes las funciones de orden superior.
