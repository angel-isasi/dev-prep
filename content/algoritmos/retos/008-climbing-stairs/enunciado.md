Escribe la función `formasDeSubir(n)` que reciba la cantidad de escalones de una escalera y devuelva **de cuántas formas distintas** puedes llegar arriba si en cada paso subes **1 o 2 escalones**.

## Reglas

- `n` es un entero mayor o igual a 1.
- Dos formas son distintas si el orden de los pasos cambia: subir `1 + 2` no es lo mismo que `2 + 1`.
- Debe responder rápido incluso con `n = 45` (el resultado pasa de 1800 millones).

## Ejemplos

```js
formasDeSubir(1);   // 1   [1]
formasDeSubir(2);   // 2   [1+1], [2]
formasDeSubir(3);   // 3   [1+1+1], [1+2], [2+1]
formasDeSubir(5);   // 8
```

## Reto extra

La recursión directa funciona con números chicos, pero con `n = 45` tarda muchísimo. ¿Puedes hacerlo en **O(n)** de tiempo y **O(1)** de memoria?
