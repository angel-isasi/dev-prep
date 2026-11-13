Escribe la función `maxGanancia(precios)` que reciba un arreglo donde `precios[i]` es el precio de una acción el día `i`, y devuelva la **máxima ganancia** que puedes obtener comprando un día y vendiendo un día **posterior**.

## Reglas

- Solo haces una compra y una venta.
- Tienes que comprar **antes** de vender: no puedes vender el día 0 y comprar el día 3.
- Si ninguna operación da ganancia (los precios solo bajan), devuelve `0`.
- Si hay uno o ningún día, devuelve `0`.
- Los precios son números mayores o iguales a 0.

## Ejemplos

```js
maxGanancia([7, 1, 5, 3, 6, 4]);  // 5  compras a 1 (día 1), vendes a 6 (día 4)
maxGanancia([7, 6, 4, 3, 1]);     // 0  siempre baja, mejor no operar
maxGanancia([3, 8, 1, 4]);        // 5  compras a 3, vendes a 8 (no 8 - 1, el 1 viene después)
maxGanancia([2]);                 // 0
```

## Reto extra

Probar todas las parejas (compra, venta) es O(n²). ¿Puedes hacerlo en **una sola pasada** y sin memoria extra, O(n) de tiempo y O(1) de memoria?
