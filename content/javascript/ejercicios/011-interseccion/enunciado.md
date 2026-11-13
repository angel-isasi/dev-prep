Escribe la función `interseccion(a, b)` que reciba dos arreglos y devuelva un arreglo nuevo con los elementos que están **en los dos**, **sin repetir**.

## Reglas

- Cada elemento común aparece **una sola vez** en el resultado, aunque esté repetido en los arreglos.
- El orden es el del **primer arreglo** (`a`).
- Si no hay elementos en común, o alguno está vacío, devuelve `[]`.
- No modifiques los arreglos originales.
- Funciona con números y con textos.

## Ejemplos

```js
interseccion([1, 2, 2, 3], [2, 3, 4]);           // [2, 3]
interseccion([3, 1, 2], [1, 2, 3]);              // [3, 1, 2]
interseccion(["ana", "luis"], ["luis", "eva"]);  // ["luis"]
interseccion([1, 2], [3, 4]);                    // []
interseccion([], [1, 2]);                        // []
```

## Por qué importa

"Qué tienen en común dos listas" aparece en todas partes: amigos en común, productos que están en dos categorías, permisos compartidos. En entrevistas lo usan para ver si conoces `Set` y si piensas en la eficiencia: buscar en un `Set` es inmediato, buscar con `includes` recorre todo el arreglo.
