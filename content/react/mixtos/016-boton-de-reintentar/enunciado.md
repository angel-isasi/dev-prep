Cuando una carga falla (sin internet, servidor caído), la peor experiencia es una pantalla rota sin salida. Crea el componente `Carga` que, si falla, muestra un mensaje y un botón para **reintentar**.

## Reglas

- Exporta `Carga({ cargar })`. `cargar` es una función asíncrona que devuelve un texto.
- Al montar, llama a `cargar()`.
- Mientras carga: `<p>Cargando…</p>`.
- Si sale bien: `<p>` con el texto que devolvió `cargar`.
- Si falla:
  - `<p role="alert">No se pudo cargar el menú</p>`
  - un `<button>` con el texto `Reintentar`, que vuelve a llamar a `cargar()` (y muestra `Cargando…` mientras tanto).
- Usa **un solo estado** con una propiedad `fase` (`"cargando"`, `"error"` o `"listo"`) en lugar de varios booleanos.

## Ejemplo

| Paso | Se ve |
|---|---|
| monta, `cargar()` falla | `No se pudo cargar el menú` + botón `Reintentar` |
| clic en Reintentar | `Cargando…` |
| `cargar()` devuelve `"Menú listo"` | `Menú listo` |

## Por qué importa

Modelar la carga como **una máquina de estados** (`fase`) evita combinaciones imposibles como "cargando y con error a la vez", que aparecen cuando usas `cargando`, `error` y `datos` por separado. Además, reutilizar la misma función para la carga inicial y para el reintento te obliga a pensar en `useCallback` y en las dependencias de `useEffect`.
