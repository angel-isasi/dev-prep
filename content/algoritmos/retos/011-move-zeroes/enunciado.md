Escribe la función `moverCeros(nums)` que mueva todos los ceros del arreglo **al final**, manteniendo el **orden original** de los demás números. Debes modificar el **mismo arreglo** que recibes (en el lugar) y devolverlo.

## Reglas

- Modifica `nums` directamente: no crees un arreglo nuevo para devolverlo.
- Los números distintos de cero conservan su orden relativo: `[0, 3, 1]` queda `[3, 1, 0]`, no `[1, 3, 0]`.
- Puede haber negativos, y el arreglo puede no tener ceros o tener solo ceros.
- Devuelve el mismo arreglo (`nums`) al terminar.

## Ejemplos

```js
moverCeros([0, 1, 0, 3, 12]);   // [1, 3, 12, 0, 0]
moverCeros([0]);                // [0]
moverCeros([1, 2]);             // [1, 2]

const datos = [0, 5];
moverCeros(datos);
datos;                          // [5, 0]  se modificó el original
```

## Reto extra

Hazlo en **una sola pasada**, O(n) de tiempo, y **sin arreglos auxiliares**, O(1) de memoria.
