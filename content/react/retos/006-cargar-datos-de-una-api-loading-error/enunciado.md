Crea el componente `Noticias`, que al montarse pide las noticias a la URL **`/api/noticias`** con `fetch` y muestra uno de tres estados: **cargando**, **error** o **datos**. No recibe props.

La API responde un arreglo de objetos `{ id, titulo }`.

## Reglas

- Mientras espera la respuesta, muestra el texto **`Cargando...`** (con tres puntos).
- Si la respuesta llega bien, muestra una `<ul>` con un `<li>` por noticia, con su `titulo`.
- Si la API responde un arreglo vacío, muestra **`No hay noticias`**.
- Si el servidor responde con un error HTTP (`ok` es `false`), muestra un párrafo con `role="alert"` que contenga **`Error <status>`**, por ejemplo `No se pudo cargar: Error 500`.
- Si `fetch` falla por la red (la promesa se rechaza), muestra también un `role="alert"` con el mensaje del error, por ejemplo `No se pudo cargar: Failed to fetch`.
- La petición se hace **una sola vez**, al montar el componente.

## Ejemplo

```jsx
<Noticias />
```

| Respuesta de `/api/noticias` | Se ve |
|---|---|
| (todavía no llega) | `Cargando...` |
| `200` con `[{ id: 1, titulo: "Festival 2026" }]` | una lista con `Festival 2026` |
| `200` con `[]` | `No hay noticias` |
| `500` | `No se pudo cargar: Error 500` |
| sin conexión | `No se pudo cargar: Failed to fetch` |

## Por qué importa

Pedir datos y mostrarlos es lo que harás todos los días en un trabajo frontend. Es pregunta casi segura: quieren ver si usas `useEffect` bien, si manejas los tres estados (y no solo el "camino feliz") y si sabes que `fetch` **no** lanza error con un 404 o un 500.
