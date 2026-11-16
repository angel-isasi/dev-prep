## El problema

Esta vez la función ya está escrita y funciona. Lo que falta son **sus tests**. En el trabajo, casi todo cambio lleva tests, y una buena suite atrapa los errores antes de que lleguen al usuario.

La app tiene **la función correcta y 4 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error. Cada versión que atrapes es un test en verde.

## La función que vas a probar

`precioConDescuento(precio, porcentaje)` aplica un descuento y devuelve el precio final redondeado a 2 decimales.

- `porcentaje` va de `0` a `100`.
- Si `porcentaje` está fuera de ese rango, lanza un `Error`.
- El resultado nunca es negativo.

```js
precioConDescuento(100, 20);  // 80
precioConDescuento(19.99, 15); // 16.99
precioConDescuento(50, 0);    // 50
precioConDescuento(50, 100);  // 0
precioConDescuento(50, 120);  // lanza Error
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest:

```js
export function misTests({ test, expect }, precioConDescuento) {
  test("aplica un 20 % de descuento", () => {
    expect(precioConDescuento(100, 20)).toBe(80);
  });
}
```

Para probar que algo lanza un error: `expect(() => precioConDescuento(50, 120)).toThrow()`.

Escribe **al menos 3 tests**. Piensa como alguien que quiere romper la función: ¿qué pasa en los límites?
