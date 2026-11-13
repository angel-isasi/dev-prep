Escribe la función `maxSubarreglo(nums)` que reciba un arreglo de números y devuelva **la suma más grande** que puedes obtener sumando un **subarreglo contiguo** (un tramo de elementos seguidos, sin saltarte ninguno).

## Reglas

- El arreglo tiene al menos un elemento.
- El tramo no puede estar vacío: al menos tiene un número.
- Contiguo significa seguido: en `[4, -1, 2]` no puedes tomar el 4 y el 2 sin el -1.
- Si todos los números son negativos, la respuesta es el mayor de ellos (el "menos negativo").

## Ejemplos

```js
maxSubarreglo([-2, 1, -3, 4, -1, 2, 1, -5, 4]);  // 6   el tramo [4, -1, 2, 1]
maxSubarreglo([5, 4, -1, 7, 8]);                 // 23  conviene cruzar el -1
maxSubarreglo([1]);                              // 1
maxSubarreglo([-3, -1, -2]);                     // -1
```

## Reto extra

Probar todos los tramos posibles es O(n²). El algoritmo de **Kadane** lo resuelve en **una sola pasada**, O(n) de tiempo y O(1) de memoria. ¿Puedes descubrirlo?
