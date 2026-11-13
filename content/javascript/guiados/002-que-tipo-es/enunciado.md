Escribe la función `tipoDe(valor)` que devuelva el tipo de un valor como texto, igual que `typeof`, pero **corrigiendo sus dos trampas más famosas**.

## Reglas

- Para `null` devuelve `"null"` (con `typeof` sale `"object"`).
- Para un array devuelve `"array"` (con `typeof` también sale `"object"`).
- Para todo lo demás devuelve lo mismo que `typeof`: `"string"`, `"number"`, `"boolean"`, `"undefined"`, `"object"`, `"function"`, etc.

## Ejemplos

```js
tipoDe("hola");        // "string"
tipoDe(42);            // "number"
tipoDe(NaN);           // "number"  (sí, NaN es de tipo number)
tipoDe(null);          // "null"
tipoDe([1, 2]);        // "array"
tipoDe({ a: 1 });      // "object"
tipoDe(() => {});      // "function"
tipoDe(undefined);     // "undefined"
```

## Por qué importa

"¿Qué devuelve `typeof null`?" es una de las preguntas trampa más repetidas en entrevistas junior. Además, en el día a día necesitas saber si te llegó un array, un objeto o nada, por ejemplo al leer la respuesta de una API.
