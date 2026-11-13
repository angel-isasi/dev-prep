Escribe la función `tieneDuplicados(nums)` que reciba un arreglo de números y devuelva `true` si **algún valor aparece al menos dos veces**, o `false` si todos son distintos.

## Reglas

- Puede haber números negativos y ceros.
- Un arreglo vacío o de un solo elemento no tiene duplicados.
- No modifiques el arreglo que recibes.

## Ejemplos

```js
tieneDuplicados([1, 2, 3, 1]);   // true   el 1 se repite
tieneDuplicados([1, 2, 3, 4]);   // false
tieneDuplicados([]);             // false
tieneDuplicados([-1, 5, -1]);    // true
```

## Reto extra

Comparar cada número con todos los demás es O(n²). ¿Puedes hacerlo en **O(n)**? Y si el arreglo es enorme y el duplicado está al inicio, ¿puedes **cortar apenas lo encuentres**?
