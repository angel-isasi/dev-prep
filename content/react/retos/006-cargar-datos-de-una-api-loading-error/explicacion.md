## Idea clave

Pedir datos es un **efecto secundario**: va en un `useEffect` que corre al montar. El componente siempre está en uno de **tres estados** (cargando, error o datos) y el render decide qué pintar según cuál sea. Y `fetch` solo falla por problemas de red: un 404 o un 500 los tienes que detectar tú con `respuesta.ok`.

## Paso a paso

1. **Estado inicial "cargando".** `useState({ cargando: true, error: null, datos: [] })`. Empieza en `cargando: true` porque el primer render ocurre antes de que llegue cualquier respuesta.
2. **El efecto.** `useEffect(() => { ... }, [])`. El arreglo de dependencias vacío significa: "ejecuta esto una vez, después del primer render".
3. **Pedir y revisar `ok`.** `fetch` devuelve una promesa con la respuesta. Si `respuesta.ok` es `false` (status fuera de 200-299), lanzas `` new Error(`Error ${respuesta.status}`) ``; ese `throw` salta directo al `.catch`.
4. **Guardar el resultado.** En el `.then` final guardas los datos; en el `.catch`, el mensaje del error. En ambos casos `cargando` pasa a `false`.
5. **Limpieza con `AbortController`.** Le pasas `signal` a `fetch` y en la función de limpieza llamas `control.abort()`. Si el componente se desmonta (el usuario cambió de página), la petición se cancela. Esa cancelación llega al `.catch` como `AbortError`, y la ignoras porque no es un error real.
6. **Render con `return` tempranos.** Primero cargando, luego error, luego lista vacía y al final la lista. Es más fácil de leer que un ternario anidado.

```jsx
import { useEffect, useState } from "react";

export function Noticias() {
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: [] });

  useEffect(() => {
    const control = new AbortController();

    fetch("/api/noticias", { signal: control.signal })
      .then((respuesta) => {
        // fetch NO falla con 404 o 500: hay que revisar `ok` a mano.
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        return respuesta.json();
      })
      .then((datos) => setEstado({ cargando: false, error: null, datos }))
      .catch((error) => {
        // Si abortamos al desmontar, no es un error real.
        if (error.name === "AbortError") return;
        setEstado({ cargando: false, error: error.message, datos: [] });
      });

    // Limpieza: si el componente se desmonta antes de la respuesta, cancela la petición.
    return () => control.abort();
  }, []);

  if (estado.cargando) return <p>Cargando...</p>;
  if (estado.error) return <p role="alert">No se pudo cargar: {estado.error}</p>;
  if (estado.datos.length === 0) return <p>No hay noticias</p>;

  return (
    <ul>
      {estado.datos.map((noticia) => (
        <li key={noticia.id}>{noticia.titulo}</li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

| Momento | Estado | Lo que se pinta |
|---|---|---|
| primer render | `{ cargando: true, error: null, datos: [] }` | `Cargando...` |
| después del render, corre el efecto | igual (se lanza `fetch`) | `Cargando...` |
| llega `200` con 2 noticias | `{ cargando: false, error: null, datos: [2 noticias] }` | `<ul>` con 2 `<li>` |
| o llega `500` | `{ cargando: false, error: "Error 500", datos: [] }` | `No se pudo cargar: Error 500` |
| o se cae la red | `{ cargando: false, error: "Failed to fetch", datos: [] }` | `No se pudo cargar: Failed to fetch` |

Guardar los tres datos en **un solo objeto** y actualizarlo de una vez evita combinaciones imposibles, como `cargando: true` y `error` con mensaje al mismo tiempo.

En desarrollo, con `<StrictMode>`, React monta, desmonta y vuelve a montar el componente para ayudarte a encontrar efectos sin limpieza. Verás dos peticiones en la pestaña Red: la primera se aborta gracias a la limpieza. En producción solo hay una.

## Errores comunes

- **No revisar `respuesta.ok`.** Con un 500, `fetch` resuelve igual y `respuesta.json()` falla o devuelve un objeto de error que intentas recorrer con `map`. Lo reconoces porque la app se rompe con "map is not a function" en vez de mostrar el error.
- **Hacer el `useEffect` `async` directamente** (`useEffect(async () => {...})`). Una función `async` devuelve una promesa, y React espera que el efecto devuelva una función de limpieza o nada. Si quieres `async/await`, crea una función `async` **dentro** del efecto y llámala.
- **Olvidar el arreglo de dependencias.** Sin `[]`, el efecto corre después de **cada** render: la respuesta actualiza el estado, eso provoca otro render, que lanza otra petición... un bucle infinito de peticiones.
- **Solo manejar el camino feliz.** Sin estado de carga, el usuario ve una pantalla vacía; sin estado de error, una lista vacía que no explica nada.
- **No limpiar.** Si el usuario sale de la pantalla antes de la respuesta, el `setEstado` llega a un componente que ya no existe, y con varias peticiones pueden llegar en desorden (condición de carrera).

## Otra forma de resolverlo

Con `async/await` dentro del efecto, que muchos encuentran más legible:

```jsx
useEffect(() => {
  const control = new AbortController();

  async function cargar() {
    try {
      const respuesta = await fetch("/api/noticias", { signal: control.signal });
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
      const datos = await respuesta.json();
      setEstado({ cargando: false, error: null, datos });
    } catch (error) {
      if (error.name !== "AbortError") {
        setEstado({ cargando: false, error: error.message, datos: [] });
      }
    }
  }

  cargar();
  return () => control.abort();
}, []);
```

**¿Cuándo conviene?** Es lo mismo con otra sintaxis: elige la que te salga más natural en la entrevista. En un proyecto real, para no repetir este código en cada pantalla, se extrae a un hook propio (`useFetch`) o se usa una librería como **TanStack Query**, que además trae caché, reintentos y recarga automática.

## Cómo explicarlo en la entrevista

> "Pido los datos en un `useEffect` con dependencias vacías, para que corra una vez al montar. Manejo tres estados: cargando, error y datos, y los guardo juntos para no tener combinaciones imposibles. Algo importante: `fetch` no lanza error con un 404 o un 500, por eso reviso `respuesta.ok` y lanzo yo el error. En la limpieza aborto la petición con `AbortController`, así si el componente se desmonta no actualizo un estado que ya no existe. En un proyecto real usaría TanStack Query para tener caché y reintentos."

## Conceptos

- **`useEffect`** con `[]`: se ejecuta una vez, después del primer render.
- **Función de limpieza**: lo que devuelve el efecto; corre al desmontar.
- **`fetch`** y **`respuesta.ok`**: los errores HTTP no rechazan la promesa.
- **`AbortController`**: cancela una petición en curso.
- **Promesas**: `.then`, `.catch`, `throw` dentro de un `.then`.
- **Tres estados de una petición**: cargando, error, datos (y el caso vacío).
- **`return` temprano** en el render para cada estado.
- **`role="alert"`**: el lector de pantalla anuncia el error.
- **`StrictMode`**: en desarrollo monta los efectos dos veces a propósito.
