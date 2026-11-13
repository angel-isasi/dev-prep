Escribe la función `mayoritario(nums)` que reciba un arreglo de números y devuelva el **elemento mayoritario**: el que aparece **más de la mitad** de las veces (más de `n / 2`, donde `n` es el largo del arreglo).

## Reglas

- El arreglo tiene al menos un elemento.
- Siempre existe un elemento mayoritario (no tienes que validarlo).
- Puede haber números negativos.
- Devuelve el número, no un texto: `3`, no `"3"`.

## Ejemplos

```js
mayoritario([3, 2, 3]);               // 3   aparece 2 de 3 veces
mayoritario([2, 2, 1, 1, 1, 2, 2]);   // 2   aparece 4 de 7 veces
mayoritario([7]);                     // 7
```

## Reto extra

Contar con un objeto o un `Map` es O(n) de tiempo pero O(n) de memoria. ¿Puedes hacerlo con **O(1) de memoria**? Investiga la idea de la "votación": cada elemento distinto del candidato le quita un voto.
