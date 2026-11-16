Crea el componente `DetalleProducto`, que recibe la prop `id` y muestra el detalle del producto pidiéndolo a **`/api/practica/productos/<id>`**. Cuando el `id` cambia (el usuario eligió otro producto), pide el nuevo.

El reto está en un bug muy real: el usuario hace clic en el producto 1 y enseguida en el 2. Si la respuesta del 1 **tarda más** y llega al final, pisa a la del 2, y la pantalla muestra un producto que el usuario ya no eligió. Eso se llama **condición de carrera**, y tu componente debe evitarla.

La API responde un objeto:

```json
{ "id": 3, "nombre": "Monitor 24 pulgadas", "categoria": "pantallas", "precio": 649, "stock": 8 }
```

## Reglas

- Pide `` `/api/practica/productos/${id}` `` al montar y **cada vez que cambie `id`**.
- **Cargando:** `<p role="status">Cargando producto...</p>`. También al cambiar de `id`: no dejes a la vista el producto anterior mientras llega el nuevo.
- **Datos:** un `<article>` con:
  - `<h2>` con el `nombre`.
  - `<p>Categoría: accesorios</p>`
  - `<p>Precio: S/ 649.00</p>` (2 decimales).
  - `<p>Stock: 8</p>`, o `<p>Agotado</p>` si `stock` es `0`.
- **404:** `<p role="alert">Producto no encontrado</p>`.
- **Otro error** (respuesta no `ok` o sin conexión): `<p role="alert">No se pudo cargar el producto</p>`.
- **Sin condición de carrera:** si llega tarde la respuesta (o el error) de un `id` anterior, se ignora. Lo que se ve siempre corresponde al `id` actual.

Puedes resolverlo con una bandera `ignorar` en la limpieza del efecto o con `AbortController`: los tests aceptan las dos.

## Ejemplo

| Pasa esto | Se ve |
|---|---|
| `<DetalleProducto id={3} />` y llega el 3 | `Monitor 24 pulgadas`, `Stock: 8` |
| cambia a `id={1}` | `Cargando producto...` |
| llega el 1 (stock 0) | `Teclado mecánico`, `Agotado` |
| `id={99}` | `Producto no encontrado` |
| `id={1}` y luego `id={2}`; el 2 responde primero y el 1 después | se queda el producto 2 |

## Pruébalo con la API de práctica

- Un producto: `http://localhost:4321/api/practica/productos/3`
- Uno que no existe: `http://localhost:4321/api/practica/productos/99`
- Para provocar la carrera en tu app, pide el primero con `?retraso=3000` y el segundo con `?retraso=200`: sin protección, el lento llega al final y gana.

## Por qué importa

La condición de carrera es uno de los bugs que más aparecen en buscadores, pestañas y páginas de detalle. Preguntan por ella en entrevistas porque muestra si entiendes **para qué sirve la función de limpieza** de `useEffect`, no solo cómo se escribe.
