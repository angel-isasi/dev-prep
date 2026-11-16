# Qhatu: catálogo de productos

Catálogo que consume la API de productos, con estados de carga y error, búsqueda sin tildes, filtro por categoría y orden por precio.

## Cómo correrlo

Usa las dependencias de dev-prep, así que no hace falta `npm install`. Desde esta carpeta:

```bash
npx vitest        # tests de aceptación en modo watch
npx vite          # la app en http://localhost:5173
```

## Estructura

```
src/
  api.js                      API falsa (500 ms, falla 1 de cada 5 veces)
  App.jsx                     une la petición, los filtros y la lista
  hooks/useProducts.js        estado de la petición: loading, error o success, y retry()
  lib/catalog.js              funciones puras: formatPrice, normalize, filterProducts, sortProducts
  components/Filters.jsx      controles controlados (sin estado propio)
  components/ProductList.jsx  la lista de productos
```

## Mis decisiones

- **La petición vive en un hook** (`useProducts`). `App` no sabe cómo se piden los datos, solo recibe `status`, `products` y `retry`. Si mañana la API es un `fetch` real, solo cambia el hook.
- **Un solo `status` en vez de varios booleanos.** Con `isLoading` e `isError` por separado se puede llegar a estados imposibles (cargando y con error a la vez). Con `"loading" | "error" | "success"` no.
- **Reintentar con un contador.** `retry()` pone `loading` y suma 1 a `attempt`, que está en las dependencias del efecto: así el efecto se vuelve a ejecutar sin duplicar código.
- **Respuestas viejas ignoradas.** La limpieza del efecto marca `ignore = true`. Si el componente se desmonta o se reintenta antes de que llegue la respuesta, no se pisa el estado nuevo.
- **La lista visible es estado derivado.** Se calcula con `filterProducts` y `sortProducts` a partir de `products` y `filters`. No la guardo en otro `useState`: así nunca queda desincronizada.
- **No muto los datos.** `sortProducts` usa `toSorted()`, que devuelve un arreglo nuevo. `sort()` habría modificado el arreglo que llegó de la API.
- **Las categorías salen de los datos** con un `Set`, ordenadas con `localeCompare("es")` para que las tildes se ordenen bien.
- **Accesibilidad:** cada control tiene su `label` unido con `htmlFor` e `id` (`useId`), el error usa `role="alert"` para que el lector de pantalla lo anuncie y el contador usa `aria-live="polite"`.

## Qué mejoraría con más tiempo

- Guardar los filtros en la URL (`?q=cafe&category=Bebidas`) para poder compartir una búsqueda.
- Esperar unos milisegundos antes de filtrar (debounce) si el catálogo tuviera miles de productos.
- Paginación o scroll infinito cuando la API los devuelva por páginas.
- Tests unitarios de `lib/catalog.js` además de los de aceptación.
