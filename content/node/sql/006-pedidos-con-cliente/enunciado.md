La tabla `pedidos` no guarda el nombre del cliente ni el del producto: guarda sus **ids** (`cliente_id`, `producto_id`). Así, si Ana cambia de email, se corrige en un solo lugar. Pero la pantalla "Pedidos" necesita mostrar nombres. Para juntar tablas está `JOIN`.

## Las tablas

**clientes**

| id | nombre | email | ciudad |
|---|---|---|---|
| 1 | Ana Torres | ana.torres@correo.pe | Lima |
| 2 | Luis Quispe | luis.quispe@correo.pe | Cusco |
| 3 | María Rojas | maria.rojas@correo.pe | Arequipa |
| 4 | Jorge Mendoza | jorge.mendoza@correo.pe | Lima |
| 5 | Carla Huamán | carla.huaman@correo.pe | Trujillo |
| 6 | Diego Flores | diego.flores@correo.pe | Lima |

**productos**

| id | nombre | categoria | precio | stock |
|---|---|---|---|---|
| 1 | Teclado mecánico | perifericos | 189 | 15 |
| 2 | Mouse inalámbrico | perifericos | 59 | 40 |
| 3 | Monitor 24 pulgadas | monitores | 649 | 8 |
| 4 | Laptop 14 pulgadas | computadoras | 2899 | 5 |
| 6 | Parlante bluetooth | audio | 99 | 22 |
| 7 | Webcam HD | perifericos | 149 | 12 |
| 8 | Monitor 27 pulgadas | monitores | 999 | 3 |
| ... | | | | |

**pedidos**: `cliente_id` apunta a `clientes.id` y `producto_id` apunta a `productos.id`.

| id | cliente_id | producto_id | cantidad | fecha |
|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2026-10-02 |
| 2 | 1 | 2 | 2 | 2026-10-02 |
| 3 | 2 | 4 | 1 | 2026-10-05 |
| 4 | 3 | 3 | 2 | 2026-10-07 |
| 5 | 4 | 6 | 3 | 2026-10-10 |
| 6 | 2 | 2 | 1 | 2026-10-12 |
| 7 | 3 | 7 | 1 | 2026-10-15 |
| 8 | 1 | 8 | 1 | 2026-10-20 |
| 9 | 4 | 1 | 1 | 2026-10-22 |

## Qué hacer

1. `pedidosConCliente(db)`: todos los pedidos, ordenados por `id`, cada uno con estas propiedades:
   - `id`: el id del pedido.
   - `fecha`
   - `cliente`: el **nombre** del cliente.
   - `producto`: el **nombre** del producto.
   - `cantidad`
   - `total`: `cantidad * precio` del producto.
2. `pedidosDeCiudad(db, ciudad)`: lo mismo, pero solo los pedidos de clientes que viven en esa ciudad.

## Reglas

- Una sola consulta por función (nada de una consulta por pedido).
- `ciudad` entra como parámetro `?`.

## Ejemplos

```js
pedidosConCliente(db)[1];
// { id: 2, fecha: "2026-10-02", cliente: "Ana Torres",
//   producto: "Mouse inalámbrico", cantidad: 2, total: 118 }

pedidosDeCiudad(db, "Cusco");
// [{ id: 3, fecha: "2026-10-05", cliente: "Luis Quispe", producto: "Laptop 14 pulgadas", cantidad: 1, total: 2899 },
//  { id: 6, fecha: "2026-10-12", cliente: "Luis Quispe", producto: "Mouse inalámbrico", cantidad: 1, total: 59 }]

pedidosDeCiudad(db, "Piura");   // []
```
