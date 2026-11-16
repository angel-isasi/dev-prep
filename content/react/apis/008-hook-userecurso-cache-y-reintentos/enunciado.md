Crea el **hook personalizado** `useRecurso(url, opciones)` que pide una URL y devuelve `{ datos, error, cargando, recargar }`, con dos mejoras que tienen las librerías de datos profesionales:

1. **Caché en memoria por URL:** si ya pediste esa URL antes, entrega los datos al instante sin volver a pedir.
2. **Reintento automático con espera creciente:** si falla por la red o por un error del servidor (5xx), espera un poco y vuelve a intentar, cada vez esperando más.

Es como un mini TanStack Query hecho por ti.

## Reglas

- Firma: `useRecurso(url, { reintentos = 2, esperaBase = 500 } = {})`.
- Devuelve siempre `{ datos, error, cargando, recargar }`:
  - Al empezar sin caché: `{ datos: null, error: null, cargando: true }`.
  - Si sale bien: `datos` con el JSON, `error: null`, `cargando: false`, y guarda los datos en la caché con la `url` como clave.
  - Si falla del todo: `datos: null`, `error` con un objeto `Error`, `cargando: false`.
- **Caché:** usa un `Map` **fuera** del hook (ya está en el inicio) y exporta `limpiarCache()`. Si la url está en la caché, el hook entrega los datos **desde el primer render** (`cargando: false`) y **no** llama a `fetch`.
- **Errores HTTP:** si `respuesta.ok` es `false`, el error es `new Error("HTTP " + status)`, por ejemplo `"HTTP 503"`.
- **Qué se reintenta:** los fallos de red (`fetch` se rechaza) y los estados **500 o más**. Un **4xx** (como 404) **no** se reintenta: el error llega de inmediato, porque pedir lo mismo no lo va a arreglar.
- **Espera creciente (backoff):** antes del reintento número `n` (empezando en 0) espera `esperaBase * 2 ** n` ms. Con los valores por defecto: 1.er intento, si falla espera 500 ms, 2.º intento, si falla espera 1000 ms, 3.er intento. Si ese también falla, entrega el error. En total, como máximo `reintentos + 1` peticiones.
- **`recargar()`:** vuelve a pedir **ignorando la caché** (con sus reintentos) y actualiza la caché con lo nuevo. Mientras tanto, `cargando: true`.
- Si la `url` cambia o el componente se desmonta: ignora las respuestas viejas y **cancela los reintentos programados** (nada de `fetch` fantasma después).

## Ejemplo

```jsx
function MisTareas() {
  const { datos, error, cargando, recargar } = useRecurso("/api/practica/tareas");
  if (cargando) return <p role="status">Cargando...</p>;
  if (error) return <p role="alert">{error.message} <button onClick={recargar}>Reintentar</button></p>;
  return (
    <>
      <ul>{datos.map((t) => <li key={t.id}>{t.titulo}</li>)}</ul>
      <button onClick={recargar}>Actualizar</button>
    </>
  );
}
```

| La API responde | Peticiones | Resultado |
|---|---|---|
| `200` | 1 | datos (y quedan en caché) |
| la misma url otra vez | 0 | datos al instante |
| `500`, sin red, `200` | 3 (a los 0, 500 y 1500 ms) | datos |
| `503` siempre | 3 | `error: HTTP 503` |
| `404` | 1 | `error: HTTP 404` de inmediato |

## Pruébalo con la API de práctica

Usa el hook con `http://localhost:4321/api/practica/tareas?fallo=0.6` (o la ruta relativa en un proyecto con Vite): el 60 % de las peticiones falla con `500`, y en la pestaña Red (F12) verás los reintentos separados por 500 y 1000 ms. Compara con `?estado=404`: una sola petición y el error de inmediato.

## Por qué importa

Caché y reintentos son lo que hace TanStack Query, SWR o Apollo por debajo. Entenderlos te permite usarlas con criterio y responder preguntas como "¿qué pasa si la API falla un instante?" o "¿por qué no reintentar un 404?". Construir un hook así en una entrevista de nivel junior te pone muy por encima del promedio.
