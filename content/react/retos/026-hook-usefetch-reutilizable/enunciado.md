Crea el **hook personalizado** `useFetch(url)` que pide una URL con `fetch` y devuelve un objeto `{ datos, error, cargando }`. Así cualquier componente puede cargar datos con una sola línea.

## Reglas

- Devuelve siempre un objeto con tres propiedades:
  - `datos`: el JSON de la respuesta, o `null` si todavía no hay (o si hubo error).
  - `error`: un objeto `Error`, o `null` si no hay error.
  - `cargando`: `true` mientras se espera la respuesta, `false` cuando termina.
- Al empezar: `{ datos: null, error: null, cargando: true }`.
- Llama a `fetch(url)` y, si sale bien, guarda el resultado de `respuesta.json()` en `datos`.
- `fetch` **no falla** con un 404 o un 500: si `respuesta.ok` es `false`, el error debe ser `new Error("HTTP " + status)`, por ejemplo `"HTTP 404"`.
- Si `fetch` lanza un error (sin conexión), ese error va en `error`.
- Si la `url` cambia, vuelve a pedir.
- **Condición de carrera:** si la url cambia y la respuesta de la url **anterior** llega tarde, debe ignorarse.

## Ejemplo

```jsx
function ListaNoticias() {
  const { datos, error, cargando } = useFetch("/api/noticias");
  if (cargando) return <p>Cargando…</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return <ul>{datos.map((n) => <li key={n.id}>{n.titulo}</li>)}</ul>;
}
```

| Situación | `useFetch` devuelve |
|---|---|
| Recién montado | `{ datos: null, error: null, cargando: true }` |
| Respuesta 200 con `[...]` | `{ datos: [...], error: null, cargando: false }` |
| Respuesta 404 | `{ datos: null, error: Error("HTTP 404"), cargando: false }` |
| Sin conexión | `{ datos: null, error: Error(...), cargando: false }` |
| Cambia de `/a` a `/b` y `/a` responde último | se queda con los datos de `/b` |

## Por qué importa

Extraer lógica repetida a un hook es lo que separa a quien "usa React" de quien lo entiende. Y la condición de carrera al cambiar de URL es un bug real muy común (por ejemplo, en un buscador): saber evitarlo suma muchos puntos.
