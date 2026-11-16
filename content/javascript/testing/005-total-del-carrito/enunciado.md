## El problema

El checkout de una tienda calcula cuánto paga el cliente. Hay cantidades, un cupón y envío gratis desde cierto monto: varias reglas que se cruzan. La función ya está escrita y funciona. Te toca escribir **sus tests**.

La app tiene **la función correcta y 6 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error.

## La función que vas a probar

`totalCarrito(items, cupon)` recibe un arreglo de `{ precio, cantidad }` y, opcionalmente, un cupón. Devuelve el total a pagar, en soles, redondeado a 2 decimales:

1. **Subtotal**: la suma de `precio * cantidad` de cada item.
2. **Cupón**: solo el cupón `"DESC10"` descuenta el **10 %** del subtotal. Se acepta en mayúsculas o minúsculas (`"desc10"` también vale). Cualquier otro cupón no descuenta nada.
3. **Envío**: se cobran **S/ 15** si el monto **después del descuento** es menor que `100`. Desde `100` (incluido), el envío es gratis.
4. **Carrito vacío**: el total es `0`, sin envío.

```js
totalCarrito([{ precio: 20, cantidad: 3 }]);                 // 75   (60 + 15 de envío)
totalCarrito([{ precio: 50, cantidad: 2 }]);                 // 100  (envío gratis)
totalCarrito([{ precio: 50, cantidad: 1 }], "DESC10");       // 60   (45 + 15)
totalCarrito([{ precio: 105, cantidad: 1 }], "DESC10");      // 109.5 (94.5 + 15)
totalCarrito([]);                                            // 0
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest:

```js
export function misTests({ test, expect }, totalCarrito) {
  test("suma los precios y cobra envío", () => {
    expect(totalCarrito([{ precio: 30, cantidad: 1 }, { precio: 20, cantidad: 1 }])).toBe(65);
  });
}
```

Escribe **al menos 3 tests**. Calcula el esperado **a mano, desde las reglas**, antes de escribir cada test. Y piensa en el orden: ¿el envío se decide antes o después del cupón?
