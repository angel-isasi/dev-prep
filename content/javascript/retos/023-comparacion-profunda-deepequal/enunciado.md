Escribe la función `iguales(a, b)` que devuelva `true` si dos valores tienen **el mismo contenido**, aunque sean objetos o arreglos distintos en memoria, y `false` si no.

Recuerda que `{ a: 1 } === { a: 1 }` es `false`: `===` compara si son **el mismo objeto**, no si se parecen.

## Reglas

- Dos primitivos son iguales si `a === b` (`1` y `"1"` son distintos).
- Dos objetos son iguales si tienen **las mismas claves** y el valor de cada clave es igual (comparado también a fondo).
- Dos arreglos son iguales si tienen el mismo largo y los mismos elementos en el mismo orden.
- Un arreglo **nunca** es igual a un objeto, aunque tengan las mismas claves: `[1, 2]` no es igual a `{ 0: 1, 1: 2 }`.
- `null` solo es igual a `null`.
- El orden de las claves de un objeto no importa.
- No necesitas manejar fechas, `Map`, `Set`, `NaN` ni referencias circulares.

## Ejemplos

```js
iguales({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] });   // true
iguales({ a: 1, b: 2 }, { b: 2, a: 1 });               // true (el orden no importa)
iguales({ a: 1 }, { a: 1, b: 2 });                     // false
iguales([1, 2], { 0: 1, 1: 2 });                       // false
iguales(null, null);                                   // true
iguales(null, {});                                     // false
```

## Por qué importa

React decide si volver a pintar comparando valores, y por eso un objeto "igual pero nuevo" provoca renders de más. Los tests usan comparación profunda (`toEqual`) todo el tiempo. Implementarla es un clásico de entrevista porque exige recursión y cuidar varios casos borde con `typeof`.
