El panel de administración de la tienda muestra cifras: cuántos productos hay, cuántas unidades quedan en el almacén, el precio promedio. Esas cifras salen de **funciones de agregación**: `COUNT`, `SUM` y `AVG` resumen muchas filas en **un solo valor**.

## Las tablas

**productos** (8 filas)

| id | nombre | categoria | precio | stock |
|---|---|---|---|---|
| 1 | Teclado mecánico | perifericos | 189 | 15 |
| 2 | Mouse inalámbrico | perifericos | 59 | 40 |
| 3 | Monitor 24 pulgadas | monitores | 649 | 8 |
| 4 | Laptop 14 pulgadas | computadoras | 2899 | 5 |
| 5 | Audífonos con micrófono | audio | 129 | 0 |
| 6 | Parlante bluetooth | audio | 99 | 22 |
| 7 | Webcam HD | perifericos | 149 | 12 |
| 8 | Monitor 27 pulgadas | monitores | 999 | 3 |

**pedidos** (9 filas): cada pedido es de un cliente y un producto.

| id | cliente_id | producto_id | cantidad | fecha |
|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2026-10-02 |
| 2 | 1 | 2 | 2 | 2026-10-02 |
| 3 | 2 | 4 | 1 | 2026-10-05 |
| ... | | | | |

El cliente 1 tiene 3 pedidos, los clientes 2, 3 y 4 tienen 2 cada uno, y los clientes 5 y 6 no tienen ninguno.

## Qué hacer

1. `resumenProductos(db)`: devuelve **un objeto** `{ total, stockTotal, precioPromedio }`:
   - `total`: cuántos productos hay.
   - `stockTotal`: la suma del stock de todos.
   - `precioPromedio`: el promedio de precios, **redondeado a 2 decimales**.
2. `resumenDeCategoria(db, categoria)`: el mismo objeto, pero solo con los productos de esa categoría. Si la categoría no tiene productos, devuelve `{ total: 0, stockTotal: 0, precioPromedio: 0 }`.
3. `contarPedidosDeCliente(db, clienteId)`: devuelve **un número**: cuántos pedidos tiene ese cliente.

## Reglas

- Haz el cálculo en SQL, no trayendo las filas para sumarlas en JavaScript.
- Las propiedades del objeto deben llamarse exactamente así: usa alias con `AS`.
- Estas consultas devuelven **una sola fila**: usa `.get()` en vez de `.all()`.

## Ejemplos

```js
resumenProductos(db);
// { total: 8, stockTotal: 105, precioPromedio: 646.5 }

resumenDeCategoria(db, "perifericos");
// { total: 3, stockTotal: 67, precioPromedio: 132.33 }

resumenDeCategoria(db, "juguetes");
// { total: 0, stockTotal: 0, precioPromedio: 0 }

contarPedidosDeCliente(db, 1);   // 3
contarPedidosDeCliente(db, 5);   // 0
```
