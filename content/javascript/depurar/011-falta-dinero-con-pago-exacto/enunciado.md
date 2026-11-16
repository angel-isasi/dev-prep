## El problema

Una cajera de la bodega reporta: "Algunos clientes me pagan **el monto exacto** y el sistema dice **'Falta dinero'**. Me pasó con una compra de S/ 1.10 más S/ 2.20, pagada con S/ 3.30 justos. Con otros montos funciona bien, y si el cliente paga de más, también".

## Qué debe hacer

`pagoCompleto(precios, pagado)` suma los precios y devuelve `true` si lo pagado cubre el total, considerando montos en soles con céntimos.

```js
pagoCompleto([1.1, 2.2], 3.3);   // true  (pago exacto)
pagoCompleto([0.1, 0.2], 0.3);   // true  (pago exacto)
pagoCompleto([12.5, 7.5], 50);   // true  (paga de más)
pagoCompleto([10.5], 10.49);     // false (falta un céntimo)
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
