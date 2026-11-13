Escribe la función `mapear(lista, fn)` que haga lo mismo que `Array.prototype.map`: recibe un array y una función, y devuelve un **array nuevo** donde cada elemento es el resultado de llamar a `fn` con el elemento original.

`fn` se llama con tres argumentos, igual que en el `map` de verdad: `fn(elemento, indice, lista)`.

## Reglas

- No uses `map`, `forEach` ni otros métodos de array que recorran por ti: usa un bucle `for`.
- No modifiques el array original: devuelve uno nuevo.
- El array resultado tiene siempre la misma longitud que el original.
- Si el array está vacío, devuelve `[]` y no llames a `fn`.

## Ejemplos

```js
mapear([1, 2, 3], (n) => n * 2);                // [2, 4, 6]
mapear([1, 2, 3], (n, i) => n * i);             // [0, 2, 6]
mapear(["ica", "lima"], (s) => s.toUpperCase()); // ["ICA", "LIMA"]
mapear([], (n) => n * 2);                       // []
```

## Por qué importa

"Implementa tu propio `map`" es una pregunta clásica para ver si entiendes qué es un **callback** y una **función de orden superior**: una función que recibe otra función como argumento. Si sabes construir `map`, sabes qué pasa por dentro cada vez que lo usas en React para pintar una lista.
