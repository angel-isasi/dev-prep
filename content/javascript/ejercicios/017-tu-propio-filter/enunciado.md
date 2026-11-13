Escribe la función `filtrar(lista, cumple)` que haga lo mismo que `Array.prototype.filter`: devuelve un **array nuevo** solo con los elementos para los que la función `cumple` devuelve un valor verdadero.

`cumple` se llama con tres argumentos, igual que en el `filter` de verdad: `cumple(elemento, indice, lista)`.

## Reglas

- No uses `filter`, `forEach` ni otros métodos de array que recorran por ti: usa un bucle.
- No modifiques el array original.
- Los elementos que se quedan conservan su orden original.
- `cumple` puede devolver cualquier valor, no solo `true` o `false`: se queda el elemento si el valor es "truthy" (por ejemplo `1` o `"a"`) y se descarta si es "falsy" (`0`, `""`, `null`, `undefined`...).
- Si ningún elemento cumple, o el array está vacío, devuelve `[]`.

## Ejemplos

```js
filtrar(["sol", "arena", "mar"], (p) => p.length === 3); // ["sol", "mar"]
filtrar([1, 2, 3, 4], (n) => n % 2 === 0);               // [2, 4]
filtrar(["a", "b", "c", "d"], (letra, i) => i % 2 === 0); // ["a", "c"]
filtrar([1, 2, 3], (n) => n > 10);                       // []
```

## Por qué importa

`filter` es de los métodos que más vas a usar como frontend: buscadores, listas de tareas pendientes, productos en oferta. Construirlo tú mismo demuestra que entiendes que el bucle siempre es el mismo y que lo único que cambia es la condición que le pasas.
