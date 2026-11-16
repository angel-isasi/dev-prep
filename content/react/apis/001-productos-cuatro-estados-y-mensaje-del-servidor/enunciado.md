Crea el componente `ListaProductos`, que al montarse pide los productos a **`/api/practica/productos`** y muestra uno de **cuatro estados**: cargando, error, vacío o datos. No recibe props.

Ya sabes lo básico de cargar datos. Aquí damos un paso más, como en el trabajo: la API **no** responde un arreglo suelto, sino un objeto paginado, y cuando falla te manda **su propio mensaje de error** en el cuerpo. Además, no es lo mismo que el servidor responda con un error a que no haya conexión.

La API responde así (con estado `200`):

```json
{
  "datos": [{ "id": 1, "nombre": "Teclado mecánico", "categoria": "accesorios", "precio": 189.9, "stock": 0 }],
  "pagina": 1,
  "totalPaginas": 4,
  "total": 40
}
```

Y cuando falla (por ejemplo con `500`), el cuerpo trae `{ "error": "Error del servidor" }`.

## Reglas

- Pide **una sola vez**, al montar, con `fetch("/api/practica/productos", ...)`.
- **Cargando:** mientras espera, muestra `<p role="status">Cargando productos...</p>`.
- **Datos:** una `<ul aria-label="Productos">` con un `<li>` por producto con el texto `nombre: S/ precio` y el precio con 2 decimales, por ejemplo `Teclado mecánico: S/ 189.90`. Debajo, un párrafo `Mostrando 10 de 40 productos` (cuántos llegaron en `datos` y el `total`).
- **Vacío:** si `datos` llega vacío, muestra `No hay productos` (y no muestres la lista).
- **Error del servidor** (`respuesta.ok` es `false`): un `<p role="alert">` con `No se pudieron cargar los productos: ` seguido del mensaje `error` que manda el servidor en el JSON. Si el cuerpo no trae ese mensaje (o no es JSON), usa `Error <status>`, por ejemplo `Error 404`.
- **Sin conexión** (la promesa de `fetch` se rechaza): `No se pudieron cargar los productos: revisa tu conexión`.

## Ejemplo

| La API responde | Se ve |
|---|---|
| (todavía nada) | `Cargando productos...` |
| `200` con 2 productos de un total de 40 | la lista y `Mostrando 2 de 40 productos` |
| `200` con `datos: []` | `No hay productos` |
| `500` con `{ "error": "Error del servidor" }` | `No se pudieron cargar los productos: Error del servidor` |
| `404` con un cuerpo que no es JSON | `No se pudieron cargar los productos: Error 404` |
| sin conexión | `No se pudieron cargar los productos: revisa tu conexión` |

## Pruébalo con la API de práctica

Con la app abierta, mira en el navegador cómo responde cada caso:

- Normal: `http://localhost:4321/api/practica/productos`
- Lento: `http://localhost:4321/api/practica/productos?retraso=3000`
- Error con mensaje: `http://localhost:4321/api/practica/productos?estado=500`
- Vacío: `http://localhost:4321/api/practica/productos?vacio=1`

En la pestaña Red (F12) fíjate que el `500` **sí llega** con un cuerpo: por eso `fetch` no lo trata como error.

## Por qué importa

En una entrevista y en el trabajo te van a evaluar el **camino triste**: qué ve el usuario cuando la API tarda, falla o no trae nada. Mostrar el mensaje que da el servidor y distinguir "el servidor falló" de "no tienes internet" es lo que hace que una pantalla se sienta profesional.
