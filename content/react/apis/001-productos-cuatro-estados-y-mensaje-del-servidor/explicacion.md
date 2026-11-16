## Idea clave

Una petición tiene **tres salidas posibles**, y cada una se detecta en un lugar distinto: si `fetch` se **rechaza**, no hubo respuesta (sin red o servidor apagado); si llega una respuesta con `ok === false`, el servidor **contestó con un error** (y suele explicar cuál en el cuerpo); y si `ok` es `true`, tienes datos, que pueden venir **vacíos**. Son cuatro pantallas: cargando, error, vacío y datos.

## Paso a paso

1. **Estado inicial.** `{ cargando: true, error: null, respuesta: null }`: el primer render ocurre antes de cualquier respuesta, así que arrancas cargando.
2. **Efecto al montar.** `useEffect(..., [])` con una función `async` dentro (el efecto en sí no puede ser `async`, porque debe devolver la limpieza, no una promesa).
3. **`try/catch` solo alrededor de `fetch`.** Si cae en el `catch`, es que no hubo respuesta: el mensaje para el usuario es "revisa tu conexión". Si el error es `AbortError`, lo causó tu propia limpieza y no se muestra.
4. **Revisar `respuesta.ok`.** Un `404` o un `500` **no** rechazan la promesa. Si `ok` es `false`, lees el cuerpo para sacar el mensaje del servidor. Como el cuerpo de un error puede ser HTML o estar vacío, `respuesta.json().catch(() => null)` evita que el `json()` explote; con `` cuerpo?.error ?? `Error ${status}` `` eliges el mensaje.
5. **Guardar la respuesta entera.** El cuerpo es `{ datos, pagina, totalPaginas, total }`. Guardas todo y en el render sacas `datos` (para la lista) y `total` (para el contador).
6. **Render con `return` tempranos.** Cargando, error, vacío y al final la lista con `toFixed(2)` y el contador.

```jsx
async function cargar() {
  let respuesta;
  try {
    respuesta = await fetch("/api/practica/productos", { signal: control.signal });
  } catch (error) {
    if (error.name === "AbortError") return;
    setEstado({ cargando: false, error: "revisa tu conexión", respuesta: null });
    return;
  }
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    setEstado({ cargando: false, error: cuerpo?.error ?? `Error ${respuesta.status}`, respuesta: null });
    return;
  }
  setEstado({ cargando: false, error: null, respuesta: await respuesta.json() });
}
```

## Por qué funciona

| La API responde | Dónde cae | Estado final | Se ve |
|---|---|---|---|
| (nada todavía) | | `cargando: true` | `Cargando productos...` |
| `200` con 2 de 40 | después del `if (!ok)` | `respuesta: { datos: [2], total: 40 }` | lista y `Mostrando 2 de 40 productos` |
| `200` con `datos: []` | igual | `respuesta: { datos: [] }` | `No hay productos` |
| `500` con `{ error: "Error del servidor" }` | `if (!ok)` | `error: "Error del servidor"` | el mensaje del servidor |
| `404` con HTML | `if (!ok)`, el `json()` falla y da `null` | `error: "Error 404"` | `Error 404` |
| sin red | `catch` del `fetch` | `error: "revisa tu conexión"` | `revisa tu conexión` |

**¿Por qué `fetch` no rechaza con un 500?** Porque para `fetch` el trabajo es "traer una respuesta HTTP", y un 500 es una respuesta HTTP válida: el servidor existe, te escuchó y te contestó "fallé". Solo rechaza cuando **no hay respuesta** que entregar. Por eso `ok` (que es `true` solo con estados del 200 al 299) es tu responsabilidad.

## Errores comunes

- **Hacer `datos.map` sobre el cuerpo entero.** La API devuelve un objeto, no un arreglo: `cuerpo.map is not a function`. Siempre mira la forma real de la respuesta (en la pestaña Red o abriendo la URL).
- **Un solo `catch` para todo con un mensaje genérico.** Funciona, pero el usuario no sabe si es su internet o el servidor, y pierdes el mensaje útil que manda la API ("El título es obligatorio", "No autenticado").
- **Llamar `respuesta.json()` en un error sin protegerlo.** Si el servidor devuelve una página HTML de error, `json()` lanza `SyntaxError` y terminas mostrando "Unexpected token <" al usuario.
- **Mostrar el error del `AbortError`.** En desarrollo, con `StrictMode`, el primer montaje se aborta a propósito: si no lo ignoras, ves un error falso por un instante.
- **Olvidar el estado vacío.** Una lista vacía sin mensaje parece un error o una pantalla rota.

## Otra forma de resolverlo

Con una sola cadena de promesas y errores con "tipo". Lanzas un error propio con el mensaje del servidor y un solo `catch` decide qué mostrar:

```jsx
fetch("/api/practica/productos", { signal: control.signal })
  .then(async (respuesta) => {
    if (!respuesta.ok) {
      const cuerpo = await respuesta.json().catch(() => null);
      const error = new Error(cuerpo?.error ?? `Error ${respuesta.status}`);
      error.http = true; // marca: el servidor sí respondió
      throw error;
    }
    return respuesta.json();
  })
  .then((cuerpo) => setEstado({ cargando: false, error: null, respuesta: cuerpo }))
  .catch((error) => {
    if (error.name === "AbortError") return;
    const mensaje = error.http ? error.message : "revisa tu conexión";
    setEstado({ cargando: false, error: mensaje, respuesta: null });
  });
```

**¿Cuándo conviene?** Cuando el manejo de errores se repite en muchas pantallas: esa función que "convierte respuestas malas en errores con mensaje" se vuelve un helper (`pedirJSON(url)`) que usa toda la app. Librerías como **TanStack Query** o **axios** hacen algo parecido por ti (axios sí rechaza con estados 4xx y 5xx).

## Cómo explicarlo en la entrevista

> "Manejo cuatro estados: cargando, error, vacío y datos. Para los errores distingo dos casos: si `fetch` se rechaza es que no hubo respuesta, así que le digo al usuario que revise su conexión; si llega una respuesta con `ok` en `false`, el servidor sí contestó, entonces leo el cuerpo para mostrar su mensaje, y si no es JSON uso el código de estado. Eso es importante porque `fetch` no lanza error con un 404 o un 500. También reviso la forma de la respuesta: aquí viene paginada, así que la lista está en `datos`."

## Conceptos

- **`respuesta.ok`**: `true` solo con estados 200 a 299. Los 4xx y 5xx no rechazan la promesa.
- **Rechazo de `fetch`**: solo cuando no hay respuesta (red, CORS, servidor apagado, `abort`).
- **Cuerpo de error**: muchas APIs mandan `{ error: "..." }` junto al estado; vale la pena mostrarlo.
- **`json().catch(() => null)`**: protege contra cuerpos que no son JSON.
- **Optional chaining (`?.`) y nullish coalescing (`??`)**: valor por defecto cuando falta el mensaje.
- **Respuesta paginada**: `{ datos, pagina, totalPaginas, total }`.
- **Cuatro estados de una pantalla con datos**: cargando, error, vacío y datos.
- **`role="status"` y `role="alert"`**: los lectores de pantalla anuncian la carga y el error.
- **`AbortController`** en la limpieza del efecto.
