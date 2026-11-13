Escribe la función `zip(a, b)` que **una dos arreglos por posición**: devuelve un arreglo de pares, donde cada par tiene el elemento de `a` y el de `b` que están en la misma posición. Se llama "zip" por el cierre de una casaca, que junta los dientes de un lado con los del otro.

## Reglas

- Cada par es un arreglo de dos elementos: `[a[i], b[i]]`.
- Si los arreglos tienen distinto largo, el resultado tiene el largo del **más corto**: los elementos que sobran se ignoran.
- Si alguno está vacío, devuelve `[]`.
- No modifiques los arreglos originales.

## Ejemplos

```js
zip(["Ana", "Luis"], [18, 15]);   // [["Ana", 18], ["Luis", 15]]
zip([1, 2, 3], ["a"]);            // [[1, "a"]]
zip(["x"], [1, 2, 3]);            // [["x", 1]]
zip([], [1, 2]);                  // []
```

## Por qué importa

Es muy común recibir datos "en columnas" separadas (nombres en un arreglo, notas en otro) y tener que juntarlos fila por fila para mostrarlos en una tabla o gráfico. Además practicas algo que muchos juniors no saben: **el segundo parámetro de `map` es el índice**.
