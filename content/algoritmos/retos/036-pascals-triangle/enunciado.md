Escribe la función `trianguloPascal(numFilas)` que devuelva las primeras `numFilas` filas del **triángulo de Pascal**, como un arreglo de arreglos.

En el triángulo de Pascal:

- Cada fila empieza y termina con `1`.
- Cada número del medio es la **suma de los dos números que tiene justo encima**.

```
        1
       1 1
      1 2 1
     1 3 3 1
    1 4 6 4 1
```

El 6 de la última fila sale de 3 + 3, los dos números que tiene arriba.

## Reglas

- La fila número `i` (contando desde 0) tiene `i + 1` elementos.
- Si `numFilas` es 0, devuelve `[]`.
- Cada fila es su propio arreglo.

## Ejemplos

```js
trianguloPascal(5);
// [
//   [1],
//   [1, 1],
//   [1, 2, 1],
//   [1, 3, 3, 1],
//   [1, 4, 6, 4, 1],
// ]

trianguloPascal(1);  // [[1]]
trianguloPascal(0);  // []
```

## Reto extra

Cada fila se construye solo con la anterior. ¿Puedes escribirlo con un bucle para las filas y otro para los números del medio, sin casos especiales sueltos?
