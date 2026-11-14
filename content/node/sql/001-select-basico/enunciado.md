Una **base de datos** guarda la información de una aplicación en **tablas**. Una tabla se parece a una hoja de Excel:

- Cada **columna** es un dato con nombre y tipo: `nombre` (texto), `precio` (número).
- Cada **fila** es un registro completo: un producto, un cliente.
- Una **consulta** es una pregunta escrita en **SQL** que le haces a la base, por ejemplo: "dame el nombre y el precio de todos los productos, del más barato al más caro".

En este ejercicio usas la base de una tienda de tecnología. El test la crea en memoria y te la pasa como `db`.

## Las tablas

**productos**

| id | nombre | categoria | precio | stock |
|---|---|---|---|---|
| 1 | Teclado mecánico | perifericos | 189 | 15 |
| 2 | Mouse inalámbrico | perifericos | 59 | 40 |
| 3 | Monitor 24 pulgadas | monitores | 649 | 8 |
| 4 | Laptop 14 pulgadas | computadoras | 2899 | 5 |
| 5 | Audífonos con micrófono | audio | 129 | 0 |
| ... | (8 productos en total) | | | |

**clientes**

| id | nombre | email | ciudad |
|---|---|---|---|
| 1 | Ana Torres | ana.torres@correo.pe | Lima |
| 2 | Luis Quispe | luis.quispe@correo.pe | Cusco |
| 3 | María Rojas | maria.rojas@correo.pe | Arequipa |
| ... | (6 clientes en total) | | |

## Qué hacer

Escribe dos funciones:

1. `listarProductos(db)`: devuelve el **nombre** y el **precio** de todos los productos, ordenados del **más barato al más caro**.
2. `listarClientes(db)`: devuelve el **nombre** y la **ciudad** de todos los clientes, ordenados por **nombre** de la A a la Z.

## Cómo se corre una consulta desde Node

```js
const filas = db.prepare("SELECT nombre FROM clientes").all();
// filas es un arreglo de objetos, uno por fila:
// [{ nombre: "Ana Torres" }, { nombre: "Luis Quispe" }, ...]
```

- `db.prepare(sql)` prepara la consulta.
- `.all()` la ejecuta y devuelve **todas** las filas como un arreglo.
- Cada objeto tiene **solo las columnas que pediste** en el `SELECT`.

## Reglas

- Devuelve exactamente las columnas pedidas, ni una más (nada de `SELECT *`).
- El orden lo hace SQL con `ORDER BY`, no JavaScript con `.sort()`.
- No escribas los datos a mano: la consulta debe leer la tabla, porque los tests pueden agregar filas.

## Ejemplos

```js
listarProductos(db);
// [
//   { nombre: "Mouse inalámbrico", precio: 59 },
//   { nombre: "Parlante bluetooth", precio: 99 },
//   { nombre: "Audífonos con micrófono", precio: 129 },
//   ...
//   { nombre: "Laptop 14 pulgadas", precio: 2899 }
// ]

listarClientes(db);
// [
//   { nombre: "Ana Torres", ciudad: "Lima" },
//   { nombre: "Carla Huamán", ciudad: "Trujillo" },
//   ...
// ]
```
