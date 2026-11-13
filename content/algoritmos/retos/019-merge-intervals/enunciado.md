Escribe la función `fusionar(intervalos)` que reciba un arreglo de intervalos `[inicio, fin]` y devuelva un arreglo nuevo donde **los que se superponen estén fusionados** en uno solo.

Por ejemplo, `[1, 3]` y `[2, 6]` se superponen (comparten del 2 al 3), así que se fusionan en `[1, 6]`.

## Reglas

- En cada intervalo, `inicio <= fin`.
- **Tocarse cuenta como superponerse**: `[1, 4]` y `[4, 5]` se fusionan en `[1, 5]`.
- Un intervalo puede estar **contenido** en otro: `[1, 4]` y `[2, 3]` dan `[1, 4]`.
- Los intervalos pueden venir **desordenados**.
- Devuelve el resultado ordenado por inicio.
- Si no hay intervalos, devuelve `[]`.
- No modifiques el arreglo original ni sus intervalos.

## Ejemplos

```js
fusionar([[1, 3], [2, 6], [8, 10], [15, 18]]);  // [[1, 6], [8, 10], [15, 18]]
fusionar([[1, 4], [4, 5]]);                     // [[1, 5]]
fusionar([[1, 4], [2, 3]]);                     // [[1, 4]]
fusionar([[8, 10], [1, 3], [2, 6]]);            // [[1, 6], [8, 10]]
```
