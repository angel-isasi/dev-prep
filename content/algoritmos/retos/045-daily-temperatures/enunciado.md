Escribe la función `temperaturasDiarias(temperaturas)` que reciba las temperaturas de varios días seguidos y devuelva un arreglo donde, para cada día, diga **cuántos días hay que esperar** hasta que llegue un día **más cálido**. Si no llega ninguno, ese día lleva `0`.

## Reglas

- "Más cálido" es **estrictamente mayor**: una temperatura igual no cuenta.
- El resultado tiene el mismo largo que la entrada.
- Si no hay temperaturas, devuelve `[]`.
- No modifiques el arreglo original.

## Ejemplos

```js
temperaturasDiarias([73, 74, 75, 71, 69, 72, 76, 73]);
// [1, 1, 4, 2, 1, 1, 0, 0]
// el día 2 (75) espera 4 días hasta el 76 del día 6

temperaturasDiarias([30, 40, 50, 60]);   // [1, 1, 1, 0]
temperaturasDiarias([90, 80, 70]);       // [0, 0, 0]   nunca sube
temperaturasDiarias([70, 70, 71]);       // [2, 1, 0]   70 no es más cálido que 70
```

## Reto extra

Buscar hacia adelante desde cada día es O(n²). Con una **pila monotónica** (una pila de días que todavía esperan respuesta) se resuelve en **una sola pasada**, O(n).
