Escribe la función `stockDe(producto)` que devuelva el stock de un producto, leído de `producto.inventario.stock`. Si ese dato no existe, devuelve `null`.

El problema: los datos vienen de una API y a veces están incompletos. Puede faltar `inventario`, o incluso puede llegar `producto` como `null` o `undefined`. Tu función **nunca debe lanzar un error**.

## Reglas

- Si `producto.inventario.stock` existe, devuélvelo tal cual.
- Un stock de `0` es un dato válido (el producto está agotado): devuelve `0`, no `null`.
- Si falta el producto, el inventario o el stock, devuelve `null`.

## Ejemplos

```js
stockDe({ nombre: "Polo", inventario: { stock: 15 } });  // 15
stockDe({ nombre: "Gorra", inventario: { stock: 0 } });  // 0
stockDe({ nombre: "Casaca" });                           // null
stockDe(null);                                           // null
stockDe(undefined);                                      // null
```

## Por qué importa

`Cannot read properties of undefined` es probablemente el error más común en frontend. Pasa cada vez que lees una propiedad de algo que todavía no llegó. El encadenamiento opcional `?.` y el operador `??` existen justo para esto, y confundir `??` con `||` es un bug clásico cuando el valor puede ser `0` o `""`.
