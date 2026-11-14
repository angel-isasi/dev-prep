Escribe la función `insertarIntervalo(intervalos, nuevo)` que reciba una lista de intervalos `[inicio, fin]` **ordenada por inicio y sin superposiciones**, y un intervalo `nuevo`. Devuelve una lista nueva con `nuevo` insertado en su lugar, **fusionando** los intervalos que se superpongan con él, para que el resultado siga ordenado y sin superposiciones.

## Reglas

- `intervalos` ya viene ordenado por inicio y sus intervalos no se superponen entre sí.
- En cada intervalo, `inicio <= fin`.
- **Tocarse cuenta como superponerse**: `[1, 5]` y `[5, 7]` se fusionan en `[1, 7]`.
- `intervalos` puede estar vacío.
- Devuelve un arreglo nuevo. No modifiques `intervalos`, sus intervalos ni `nuevo`.

## Ejemplos

```js
insertarIntervalo([[1, 3], [6, 9]], [2, 5]);
// [[1, 5], [6, 9]]

insertarIntervalo([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]);
// [[1, 2], [3, 10], [12, 16]]   [4, 8] se superpone con [3, 5], [6, 7] y [8, 10]

insertarIntervalo([[1, 2], [6, 7]], [3, 4]);
// [[1, 2], [3, 4], [6, 7]]   no toca a nadie: solo se mete en medio

insertarIntervalo([], [5, 7]);
// [[5, 7]]
```

## Reto extra

Podrías agregar `nuevo` al final, ordenar todo y fusionar como en **Merge Intervals**, pero eso es O(n log n). Como la lista **ya está ordenada**, se puede hacer en **una sola pasada**, O(n).
