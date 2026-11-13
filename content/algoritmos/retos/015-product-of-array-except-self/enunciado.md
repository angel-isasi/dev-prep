Escribe la función `productoExceptoYo(nums)` que reciba un arreglo de números y devuelva un **arreglo nuevo** del mismo largo, donde cada posición `i` tenga el **producto de todos los elementos menos `nums[i]`**.

## Reglas

- **No puedes usar división.** (Además, con ceros la división falla).
- El arreglo tiene al menos 2 elementos.
- Puede haber ceros y negativos.
- No modifiques el arreglo original.

## Ejemplos

```js
productoExceptoYo([1, 2, 3, 4]);         // [24, 12, 8, 6]
// posición 0: 2 * 3 * 4 = 24
// posición 1: 1 * 3 * 4 = 12
// posición 2: 1 * 2 * 4 = 8
// posición 3: 1 * 2 * 3 = 6

productoExceptoYo([-1, 1, 0, -3, 3]);    // [0, 0, 9, 0, 0]
productoExceptoYo([3, 4]);               // [4, 3]
```

## Reto extra

Multiplicar todos los demás para cada posición es O(n²). Hazlo en **O(n)** de tiempo y, sin contar el arreglo de salida, **O(1)** de memoria extra.
