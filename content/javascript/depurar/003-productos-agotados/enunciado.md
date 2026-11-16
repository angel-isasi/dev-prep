## El problema

El encargado del almacén reporta: "El panel dice que tengo **más productos agotados de los que hay**. Los conté a mano en la hoja y son 2, pero el panel dice 3. Me parece que el número sube cuando hay productos nuevos que todavía no tienen stock registrado".

## Qué debe hacer

`contarAgotados(stocks)` cuenta los productos con stock **exactamente** `0`. Una celda vacía (`""`) significa "sin registrar", no "agotado", así que no se cuenta.

```js
contarAgotados([5, 0, "", 12, 0]); // 2
contarAgotados(["", "", 3]);       // 0
contarAgotados([0, 0, 0]);         // 3
contarAgotados([]);                // 0
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
