Agrega a todos los arreglos tres métodos propios, `miMap`, `miFilter` y `miReduce`, que funcionen como `map`, `filter` y `reduce`. Se definen en `Array.prototype`, y dentro de cada uno `this` es el arreglo sobre el que se llamó.

## Reglas

- **`miMap(callback)`**: devuelve un arreglo **nuevo** con el resultado de `callback(elemento, indice, arreglo)` para cada elemento.
- **`miFilter(callback)`**: devuelve un arreglo **nuevo** solo con los elementos para los que `callback(elemento, indice, arreglo)` da un valor verdadero.
- **`miReduce(callback, inicial)`**: recorre acumulando con `callback(acumulador, elemento, indice, arreglo)` y devuelve el acumulador final.
  - **Con** valor inicial, el acumulador empieza en `inicial` y se recorre desde el índice 0.
  - **Sin** valor inicial, el acumulador empieza en el primer elemento y se recorre desde el índice 1.
  - Sin valor inicial y con el arreglo vacío, lanza un `TypeError`.
- Ninguno modifica el arreglo original.
- No uses los `map`, `filter` ni `reduce` nativos dentro de tus métodos: recorre con un `for`.

## Ejemplos

```js
[1, 2, 3].miMap((x) => x * 2);                 // [2, 4, 6]
[1, 2, 3, 4].miFilter((x) => x % 2 === 0);     // [2, 4]
[1, 2, 3].miReduce((a, b) => a + b);           // 6
[1, 2, 3].miReduce((a, b) => a + b, 10);       // 16
[].miReduce((a, b) => a + b, 0);               // 0
[].miReduce((a, b) => a + b);                  // TypeError
```

## Por qué importa

`map`, `filter` y `reduce` son el pan de cada día en React (listas, filtros, totales). Escribir su polyfill es una pregunta clásica: demuestra que sabes qué hacen por dentro, cómo funciona `this` en los prototipos y el detalle de `reduce` sin valor inicial, que mucha gente usa sin entender.
