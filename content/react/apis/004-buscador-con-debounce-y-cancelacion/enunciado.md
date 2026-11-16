Crea el componente `BuscadorProductos`: un campo de búsqueda que consulta **`/api/practica/productos?q=<texto>`** mientras escribes. No recibe props.

Si pidieras en cada tecla, escribir "disco ssd" lanzaría 9 peticiones, y las respuestas podrían llegar desordenadas. En el trabajo se hacen dos cosas:

1. **Debounce:** esperar a que el usuario **deje de escribir** 400 ms antes de pedir.
2. **Cancelar** la petición anterior con `AbortController` si empieza una búsqueda nueva.

La API responde `{ datos, pagina, totalPaginas, total }`, y los productos están en `datos`.

## Reglas

- Un `<input type="search" aria-label="Buscar productos">` controlado (ya viene en el archivo de inicio).
- Cuando el texto cambia, espera **400 ms** sin cambios y recién pide `/api/practica/productos?q=<texto>`, con el texto sin espacios a los lados y codificado para URL (`encodeURIComponent`). Si sigues escribiendo antes de los 400 ms, la espera vuelve a empezar.
- Pasa `signal` de un `AbortController` a `fetch`. Si el texto cambia mientras una petición está en curso, **abórtala**: su respuesta no debe mostrarse.
- Si el texto está vacío o solo tiene espacios: no pidas nada y no muestres resultados ni mensajes.
- **Buscando:** desde que hay texto hasta que llega la respuesta, `<p role="status">Buscando...</p>`.
- **Resultados:** `<ul aria-label="Resultados">` con un `<li>` por producto con su `nombre`.
- **Sin resultados:** `No hay resultados para "<texto>"`, por ejemplo `No hay resultados para "xyz"`.
- **Error:** `<p role="alert">No se pudo buscar: Error 500</p>` (con el `status` que corresponda).
- Un `AbortError` **no** es un error para el usuario: ignóralo.

## Ejemplo

| Escribes | Pasa |
|---|---|
| `d`, `di`, `dis`... `disco ssd` rápido | ninguna petición todavía, se ve `Buscando...` |
| (400 ms sin escribir) | una sola petición: `?q=disco%20ssd` |
| `mon`, espera, y luego `mouse` | la petición de `mon` se aborta; solo se ven los resultados de `mouse` |
| borras todo | desaparecen los resultados, sin peticiones |

## Pruébalo con la API de práctica

- `http://localhost:4321/api/practica/productos?q=monitor`
- `http://localhost:4321/api/practica/productos?q=xyz` (sin resultados)
- Con `&retraso=2000` agregado a tu URL, escribe rápido y mira la pestaña Red (F12): las peticiones canceladas salen como **(canceled)**.

## Por qué importa

El buscador con debounce es de los ejercicios en vivo más pedidos para frontend junior. Combina temporizadores, efectos con limpieza y cancelación de peticiones: si lo explicas bien, demuestras que piensas en el rendimiento y en el servidor, no solo en que "funcione".
