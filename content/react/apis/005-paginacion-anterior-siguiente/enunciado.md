Crea el componente `ProductosPaginados`, que muestra los productos **de 10 en 10** pidiendo cada página a la API, con botones **Anterior** y **Siguiente**. No recibe props.

Casi ninguna API real te manda miles de registros de golpe: te los da por páginas y te dice cuántas hay. La API de práctica responde:

```json
{ "datos": [ ...10 productos... ], "pagina": 2, "totalPaginas": 4, "total": 40 }
```

## Reglas

- Pide `/api/practica/productos?pagina=<n>&limite=10`. Al montar, la página 1.
- **Primera carga:** `<p role="status">Cargando productos...</p>`.
- **Lista:** `<ul aria-label="Productos">` con un `<li>` por producto con su `nombre`.
- Debajo, dos botones y entre ellos el texto **`Página X de Y`**, tomado de `pagina` y `totalPaginas` **de la respuesta**.
- **Anterior** está deshabilitado (`disabled`) en la página 1. **Siguiente** está deshabilitado en la última página.
- **Mientras carga otra página, los dos botones están deshabilitados** (así nadie hace cinco clics seguidos y lanza cinco peticiones). Puedes dejar la lista anterior a la vista mientras tanto.
- Si `total` es `0`: muestra `No hay productos` y ningún botón.
- Si falla el cambio de página: deja la lista y el texto de la página anterior, muestra un `<p role="alert">` con el error y permite volver a hacer clic (el mismo clic debe hacer una petición nueva).
- Si la primera carga falla: `<p role="alert">` con `No se pudieron cargar los productos: Error 500` (con su `status`).

## Ejemplo

| Pasa esto | Se ve |
|---|---|
| monta (40 productos) | Producto 1 a 10, `Página 1 de 4`, Anterior deshabilitado |
| clic en Siguiente | botones deshabilitados mientras llega la página 2 |
| llega la página 2 | Producto 11 a 20, `Página 2 de 4`, los dos botones activos |
| en la página 4 | Siguiente deshabilitado |
| solo 3 productos | `Página 1 de 1`, los dos deshabilitados |

## Pruébalo con la API de práctica

- `http://localhost:4321/api/practica/productos?pagina=2&limite=10`
- Página fuera de rango: `http://localhost:4321/api/practica/productos?pagina=99&limite=10` (la API te devuelve la última, `pagina: 4`: por eso conviene confiar en lo que responde el servidor).
- Con `&retraso=1500`, comprueba que tus botones se deshabilitan mientras carga.

## Por qué importa

Tablas paginadas hay en casi todo panel de administración, y en las pruebas técnicas para casa piden paginación muy seguido. Lo que marca la diferencia es el detalle: botones deshabilitados en los extremos y durante la carga, y usar los números que devuelve el servidor.
