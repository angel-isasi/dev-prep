Exporta `crearApp()` con una API que **maneja sus errores en un solo lugar**: en vez de escribir `res.status(...).json({ error })` en cada ruta, las rutas **lanzan** errores con `throw` y un **middleware de errores** al final decide qué responder.

El archivo de inicio ya trae:
- `buscarProducto(id)`: función `async` que simula una base de datos (devuelve el producto o `null`).
- `leerReporte()`: función `async` que **siempre falla** con un error que trae datos secretos (usuario y clave de la base).
- `errorHttp(status, mensaje)`: crea un `Error` con una propiedad `status`.
- La ruta `GET /reporte`, que llama a `leerReporte()`.

## Lo que tienes que hacer

| Petición | Código | Respuesta |
|---|---|---|
| `GET /productos/1` | `200` | el producto |
| `GET /productos/abc` (o `0`, `-3`, `1.5`) | `400` | `{ "error": "El id debe ser un número entero positivo" }` |
| `GET /productos/99` | `404` | `{ "error": "Producto no encontrado" }` |
| `GET /reporte` | `500` | `{ "error": "Error interno del servidor" }` |
| cualquier otra ruta | `404` | `{ "error": "Ruta no encontrada" }` |

## El middleware de errores

Es un middleware con **cuatro** parámetros. Express lo reconoce por eso: con 4 parámetros, solo se ejecuta cuando hubo un error.

```js
app.use((err, req, res, next) => {
  // err es lo que se lanzó con throw (o se pasó a next(err))
  res.status(500).json({ error: "..." });
});
```

Va **al final**, después de todas las rutas. Cuando una ruta lanza un error, Express se salta las rutas que faltan y salta directo a él.

**Express 5 y `async`**: si un handler es `async` y lanza un error (o un `await` falla), Express 5 lo atrapa solo y lo manda al middleware de errores. En Express 4 había que envolver todo en `try/catch` y llamar a `next(err)` a mano; ahora no.

## No filtres detalles en los 500

Un `500 Internal Server Error` significa "falló algo del servidor, no es culpa tuya". El mensaje real del error puede traer rutas de archivos, consultas SQL o contraseñas: **nunca** lo envíes al cliente. Responde un texto genérico. En cambio, los errores 4xx (400, 404) sí son para el cliente y su mensaje se muestra tal cual.

## Reglas

- Las rutas **lanzan** con `throw errorHttp(404, "Producto no encontrado")`; el middleware de errores responde.
- En el middleware: el código es `err.status`, o `500` si el error no trae uno. Si es 500 (o mayor), el mensaje es siempre `"Error interno del servidor"`; si no, `err.message`.
- Las rutas que no existen responden `404` en **JSON** (no la página HTML que pone Express por defecto).

## Ejemplos

```js
// GET /productos/abc
// 400 { "error": "El id debe ser un número entero positivo" }

// GET /reporte   (leerReporte lanza "Conexión rechazada: postgres://admin:clave123@...")
// 500 { "error": "Error interno del servidor" }      <- sin "clave123"

// GET /usuarios
// 404 { "error": "Ruta no encontrada" }
```
