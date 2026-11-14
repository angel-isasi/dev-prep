Marketing quiere mandar un cupón a los clientes que se registraron pero **nunca compraron**. Con el `JOIN` del ejercicio anterior no se puede: solo devuelve clientes que **sí** tienen pedidos. Para conservar también a los que no tienen pareja está `LEFT JOIN`.

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

**pedidos** (9 filas)

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

(También existe la tabla `productos`, pero aquí no la necesitas.)

## Qué hacer

1. `clientesSinPedidos(db)`: `id`, `nombre` y `email` de los clientes que **no tienen ningún pedido**, ordenados por nombre.
2. `pedidosPorCliente(db)`: **todos** los clientes con `nombre` y `pedidos` (cuántos pedidos tiene), incluidos los que tienen 0. Ordenados de más a menos pedidos y, si empatan, por nombre de la A a la Z.

## Reglas

- Una sola consulta por función.
- Un cliente sin pedidos debe aparecer con `pedidos: 0`, no con 1.

## Ejemplos

```js
clientesSinPedidos(db);
// [{ id: 5, nombre: "Carla Huamán", email: "carla.huaman@correo.pe" },
//  { id: 6, nombre: "Diego Flores", email: "diego.flores@correo.pe" }]

pedidosPorCliente(db);
// [{ nombre: "Ana Torres", pedidos: 3 },
//  { nombre: "Jorge Mendoza", pedidos: 2 },
//  { nombre: "Luis Quispe", pedidos: 2 },
//  { nombre: "María Rojas", pedidos: 2 },
//  { nombre: "Carla Huamán", pedidos: 0 },
//  { nombre: "Diego Flores", pedidos: 0 }]
```
