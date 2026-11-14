Casi nunca quieres **todas** las filas: quieres los productos de una categoría, los de cierto precio o los que contienen una palabra. Para eso está `WHERE`, que filtra filas con una condición.

Los valores que llegan de fuera (lo que escribe el usuario en un buscador, por ejemplo) **nunca** se pegan al texto SQL. Se pasan como **parámetros** con `?`:

```js
db.prepare("SELECT nombre FROM productos WHERE categoria = ?").all(categoria);
//                                                     ^ aquí entra el valor de `categoria`
```

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

**clientes** (6 filas)

| id | nombre | email | ciudad |
|---|---|---|---|
| 1 | Ana Torres | ana.torres@correo.pe | Lima |
| 2 | Luis Quispe | luis.quispe@correo.pe | Cusco |
| 3 | María Rojas | maria.rojas@correo.pe | Arequipa |
| 4 | Jorge Mendoza | jorge.mendoza@correo.pe | Lima |
| 5 | Carla Huamán | carla.huaman@correo.pe | Trujillo |
| 6 | Diego Flores | diego.flores@correo.pe | Lima |

## Qué hacer

Escribe cuatro funciones, cada una con **una** consulta:

1. `productosDeCategoria(db, categoria)`: `id`, `nombre` y `precio` de los productos de esa categoría, del más barato al más caro.
2. `productosEnRango(db, minimo, maximo)`: `nombre` y `precio` de los productos con precio entre `minimo` y `maximo` (**ambos incluidos**), del más barato al más caro.
3. `buscarProductos(db, texto)`: `id` y `nombre` de los productos cuyo nombre **contiene** `texto`, ordenados por nombre.
4. `clientesDeCiudades(db, ciudadA, ciudadB)`: `nombre` y `ciudad` de los clientes que viven en **cualquiera** de las dos ciudades, ordenados por nombre.

## Reglas

- Usa siempre `?` para los valores. Nunca armes el SQL concatenando texto (`"... = '" + categoria + "'"`).
- Si no hay coincidencias, devuelve un arreglo vacío.
- Para "contiene" usa `LIKE` con `%` (comodín que significa "cualquier texto").

## Ejemplos

```js
productosDeCategoria(db, "audio");
// [{ id: 6, nombre: "Parlante bluetooth", precio: 99 },
//  { id: 5, nombre: "Audífonos con micrófono", precio: 129 }]

productosEnRango(db, 99, 149);
// [{ nombre: "Parlante bluetooth", precio: 99 },
//  { nombre: "Audífonos con micrófono", precio: 129 },
//  { nombre: "Webcam HD", precio: 149 }]

buscarProductos(db, "monitor");
// [{ id: 3, nombre: "Monitor 24 pulgadas" }, { id: 8, nombre: "Monitor 27 pulgadas" }]

clientesDeCiudades(db, "Cusco", "Trujillo");
// [{ nombre: "Carla Huamán", ciudad: "Trujillo" }, { nombre: "Luis Quispe", ciudad: "Cusco" }]

productosDeCategoria(db, "x' OR '1'='1");   // []   (un intento de inyección SQL no trae nada)
```
