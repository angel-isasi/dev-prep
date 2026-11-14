Escribe la función `ordenarColores(nums)` que reciba un arreglo con solo tres valores posibles: `0` (rojo), `1` (blanco) y `2` (azul), y lo ordene para que queden **primero todos los 0, luego todos los 1 y al final todos los 2**.

Debes modificar el **mismo arreglo** que recibes (en el lugar) y devolverlo.

## Reglas

- Solo aparecen los números `0`, `1` y `2`.
- Modifica `nums` directamente y devuelve ese mismo arreglo.
- El arreglo puede estar vacío o tener un solo color.
- No uses `sort`: la gracia es ordenar sabiendo que solo hay tres valores.

## Ejemplos

```js
ordenarColores([2, 0, 2, 1, 1, 0]);   // [0, 0, 1, 1, 2, 2]
ordenarColores([2, 0, 1]);            // [0, 1, 2]
ordenarColores([1, 1]);               // [1, 1]

const datos = [1, 0];
ordenarColores(datos);
datos;                                // [0, 1]  se modificó el original
```

## Reto extra

Contar cuántos hay de cada color y reescribir el arreglo funciona en dos pasadas. ¿Puedes hacerlo en **una sola pasada** y con O(1) de memoria, usando **tres punteros**? Es el problema clásico de la **bandera holandesa** (rojo, blanco y azul).
