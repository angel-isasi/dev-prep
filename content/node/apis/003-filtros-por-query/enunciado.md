Exporta `crearApp()` con la ruta `GET /productos`, que acepta filtros opcionales en la **query string**:

- `categoria`: solo los productos de esa categoría (comparación exacta).
- `max`: solo los productos con `precio <= max`.

Los datos vienen en el archivo de inicio (6 productos con `id`, `nombre`, `categoria` y `precio`).

## Query params

La **query string** es lo que va después del `?` en la URL: `/productos?categoria=audio&max=100`. Son pares `clave=valor` separados por `&`. Sirven para **filtrar, ordenar o paginar** una lista, sin cambiar de recurso: sigue siendo `/productos`.

Express los deja en `req.query`:

```js
// GET /productos?categoria=audio&max=100
req.query; // { categoria: "audio", max: "100" }
```

Igual que `req.params`, **todo es texto**: `max` llega como `"100"`. Si comparas `precio <= "100"`, JavaScript convierte por ti y a veces acierta, pero con texto inválido (`"barato"`) el resultado no tiene sentido. Convierte con `Number` y valida.

## El código 400

`400 Bad Request` significa "tu petición está mal formada": el error es **del cliente**. Es distinto de 404 (no existe) y de 500 (falló el servidor). Si `max` no es un número, responde `400` con `{ "error": "max debe ser un número" }`.

## Reglas

- Sin filtros, devuelve todos los productos.
- Los filtros se pueden combinar (los dos se cumplen a la vez).
- Mantén el orden original.
- Un parámetro vacío (`?max=` o `?categoria=`) cuenta como si no viniera.
- Si ningún producto cumple, responde `200` con `[]`: una lista vacía no es un error.

## Ejemplos

```js
// GET /productos?categoria=audio
[{ id: 4, nombre: "Audífonos", ... }, { id: 5, nombre: "Parlante", ... }]

// GET /productos?max=100
[{ id: 2, nombre: "Mouse", precio: 45, ... }, { id: 4, nombre: "Audífonos", precio: 90, ... }]

// GET /productos?categoria=perifericos&max=150
[Teclado (120), Mouse (45)]

// GET /productos?max=barato
// 400 { "error": "max debe ser un número" }
```
