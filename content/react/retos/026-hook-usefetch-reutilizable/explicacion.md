## Idea clave

Un **hook personalizado** encapsula estado y efectos para reutilizarlos. `useFetch` guarda `{ datos, error, cargando }` y pide la url en un `useEffect` que depende de `[url]`. Para evitar la **condición de carrera**, cada efecto tiene una bandera `activo` que su limpieza pone en `false`: si una respuesta vieja llega tarde, ve `activo === false` y no guarda nada.

## Paso a paso

1. **Estado inicial:** `{ datos: null, error: null, cargando: true }`.
2. **Efecto con `[url]`.** Corre al montar y cada vez que la url cambia.
3. **Bandera `activo`.** Cada ejecución del efecto crea su propia variable `activo = true` (gracias al closure, cada petición recuerda **su** bandera).
4. **Marca que está cargando** al empezar, con la forma funcional para no perder lo anterior.
5. **Pide con `fetch`.** En el primer `.then`, si `respuesta.ok` es `false`, lanza un `Error`; si no, devuelve `respuesta.json()` (que también es una promesa).
6. **Guarda el resultado** en el segundo `.then` o el error en el `.catch`, **solo si `activo`**.
7. **Limpieza:** `return () => { activo = false; }`. React la ejecuta cuando la url cambia (antes de correr el efecto nuevo) y al desmontar.

```jsx
import { useEffect, useState } from "react";

export function useFetch(url) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true });

  useEffect(() => {
    // `activo` pasa a false cuando la url cambia o el componente se desmonta.
    let activo = true;
    setEstado((anterior) => ({ ...anterior, cargando: true, error: null }));

    fetch(url)
      .then((respuesta) => {
        // fetch NO falla con 404 o 500: hay que revisar `ok` a mano.
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return respuesta.json();
      })
      .then((datos) => {
        if (activo) setEstado({ datos, error: null, cargando: false });
      })
      .catch((error) => {
        if (activo) setEstado({ datos: null, error, cargando: false });
      });

    return () => {
      activo = false;
    };
  }, [url]);

  return estado;
}
```

## Por qué funciona

Recorrido de la condición de carrera: la url cambia de `/lenta` a `/rapida`, y `/lenta` responde al final.

| Momento | Efecto de `/lenta` | Efecto de `/rapida` | Estado |
|---|---|---|---|
| Montaje con `/lenta` | `activo = true`, pide `/lenta` | | cargando |
| La url cambia a `/rapida` | limpieza: `activo = false` | `activo = true`, pide `/rapida` | cargando |
| Responde `/rapida` | | `activo` es true: guarda | datos de `/rapida` |
| Responde `/lenta` (tarde) | `activo` es false: **no guarda** | | sigue con `/rapida` |

Sin la bandera, la respuesta de `/lenta` sobrescribiría los datos y el usuario vería resultados de una búsqueda que ya no es la suya.

Sobre los errores: `fetch` solo rechaza la promesa si **no hubo respuesta** (sin red, CORS). Un 404 o un 500 son respuestas válidas para `fetch`, por eso revisamos `respuesta.ok` y lanzamos el error nosotros. El `throw` dentro de un `.then` hace que la cadena salte directo al `.catch`.

## Errores comunes

- **No revisar `respuesta.ok`.** Con un 404 intentas leer el JSON de una página de error y terminas con datos raros o un error confuso. Falla el test de "HTTP 404".
- **Olvidar `url` en las dependencias** (`[]`). El hook pide solo la primera url y nunca más. Falla el test de "si la url cambia".
- **No manejar la condición de carrera.** Funciona en tu máquina (las respuestas llegan en orden) y falla en producción con red lenta. Se reconoce porque la pantalla "salta" a resultados viejos.
- **Hacer el `useEffect` `async`** (`useEffect(async () => ...)`). Un efecto async devuelve una promesa, y React espera que devuelva una función de limpieza o nada. Si quieres `await`, define una función async **dentro** del efecto y llámala.
- **Llamar al hook dentro de un `if` o un bucle.** Los hooks (también los tuyos) se llaman siempre en el mismo orden, en el nivel superior del componente.

## Otra forma de resolverlo

Con **`AbortController`**, que además de ignorar la respuesta **cancela la petición** de verdad:

```jsx
useEffect(() => {
  const control = new AbortController();
  setEstado((e) => ({ ...e, cargando: true, error: null }));

  async function cargar() {
    try {
      const respuesta = await fetch(url, { signal: control.signal });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const datos = await respuesta.json();
      setEstado({ datos, error: null, cargando: false });
    } catch (error) {
      if (error.name !== "AbortError") setEstado({ datos: null, error, cargando: false });
    }
  }

  cargar();
  return () => control.abort();
}, [url]);
```

**¿Cuándo conviene?** Cuando las peticiones son pesadas o muchas (un buscador que pide con cada tecla): cancelar ahorra red. La bandera `activo` es más simple y sirve para cualquier promesa, no solo `fetch`. En proyectos reales se suele usar **TanStack Query** o **SWR**, que además dan caché, reintentos y revalidación.

## Cómo explicarlo en la entrevista

> "Extraje la lógica de pedir datos a un hook para reutilizarla en cualquier componente; devuelve datos, error y cargando. El efecto depende de la url, así que vuelve a pedir cuando cambia. Reviso `respuesta.ok` porque `fetch` no falla con un 404. Y para evitar la condición de carrera uso una bandera `activo` que la limpieza del efecto pone en false: si una respuesta vieja llega tarde, la ignoro. También se puede hacer con `AbortController`, que cancela la petición. En un proyecto real usaría TanStack Query por la caché y los reintentos."

## Conceptos

- **Hook personalizado**: función `useAlgo` que combina otros hooks.
- **`useEffect` con dependencias** `[url]`.
- **Función de limpieza** del efecto.
- **Closure**: cada ejecución del efecto recuerda su propia variable `activo`.
- **Condición de carrera** (*race condition*): respuestas que llegan en distinto orden del que se pidieron.
- **`fetch` y `respuesta.ok`**: los errores HTTP no rechazan la promesa.
- **Encadenar promesas** con `.then` y `.catch`; `throw` salta al `.catch`.
- **`AbortController`** para cancelar peticiones.
- **Reglas de los hooks**: siempre en el nivel superior, nunca dentro de `if`.
