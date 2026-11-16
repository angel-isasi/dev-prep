## Idea clave

El hook combina tres ideas. Una **caché** (`Map` fuera del hook, para que sobreviva a los desmontajes) evita pedir dos veces lo mismo. Un **reintento con espera creciente** (*backoff* exponencial) le da al servidor tiempo para recuperarse sin bombardearlo, y solo se aplica a errores que pueden arreglarse solos (red o 5xx), no a un 404. Y la **limpieza** del efecto apaga todo: respuestas viejas y reintentos programados.

## Paso a paso

1. **Caché a nivel de módulo.** `const cache = new Map()` fuera del hook: es la misma para todos los componentes y no se pierde al desmontar. `limpiarCache()` existe para los tests (y para un "cerrar sesión").
2. **Estado inicial perezoso.** `useState(() => cache.has(url) ? ... : ...)`: si ya hay datos, el primer render los muestra, sin parpadeo de "Cargando".
3. **Efecto con `[url, version]`.** `version` es el "disparador" de `recargar()` (la misma idea del contador de intentos).
4. **Atajo de caché.** Al inicio del efecto: si hay caché y no te pidieron forzar, la entregas y sales. `forzar` es un `useRef` porque es una señal para el próximo efecto, no algo que se pinte.
5. **`intentar(numero)`.** Hace el `fetch`; si `!ok`, lanza un `Error("HTTP 503")` y le pega el `status` para decidir después.
6. **Decidir en el `.catch`.** Si es reintentable (sin `status`, o sea red, o `status >= 500`) y quedan intentos, programa `setTimeout(() => intentar(numero + 1), esperaBase * 2 ** numero)`. Si no, entrega el error.
7. **Éxito.** Guarda en la caché y en el estado.
8. **Limpieza.** `activo = false` (respuestas viejas se ignoran) y `clearTimeout(temporizador)` (el reintento programado no sale).
9. **`recargar` estable.** `useCallback` con `[]`: siempre es la misma función, así un componente puede ponerla en sus dependencias sin bucles.

```jsx
function intentar(numero) {
  fetch(url)
    .then((r) => {
      if (!r.ok) { const e = new Error(`HTTP ${r.status}`); e.status = r.status; throw e; }
      return r.json();
    })
    .then((datos) => { if (activo) { cache.set(url, datos); setEstado({ datos, error: null, cargando: false }); } })
    .catch((error) => {
      if (!activo) return;
      if (esReintentable(error) && numero < reintentos) {
        temporizador = setTimeout(() => intentar(numero + 1), esperaBase * 2 ** numero);
      } else {
        setEstado({ datos: null, error, cargando: false });
      }
    });
}
```

## Por qué funciona

Con `reintentos = 2` y `esperaBase = 500`, y una API que responde `500`, luego sin red y luego `200`:

| Tiempo | Intento (`numero`) | Resultado | Decisión |
|---|---|---|---|
| 0 ms | 0 | `HTTP 500` (status 500) | reintentable y 0 < 2: espera 500 × 2⁰ = 500 ms |
| 500 ms | 1 | sin red (sin status) | reintentable y 1 < 2: espera 500 × 2¹ = 1000 ms |
| 1500 ms | 2 | `200` | guarda en caché y entrega los datos |

Si el tercero también fallara, `2 < 2` es falso y se entrega el error: 3 peticiones como máximo. Con un `404`, `esReintentable` da `false` y el error llega en la primera vuelta.

**¿Por qué espera creciente?** Si el servidor está saturado, reintentar al instante y sin parar lo empeora (y si mil usuarios hacen lo mismo, lo tumban). Esperar cada vez el doble reparte la carga y da tiempo a que se recupere. En producción se le suma un poco de azar (*jitter*) para que no todos reintenten al mismo milisegundo.

**¿Por qué no reintentar un 4xx?** Un 4xx dice "tu petición está mal" (no existe, no tienes permiso, faltan datos): repetirla igual da el mismo resultado. Un 5xx o un fallo de red dicen "algo falló de mi lado": puede arreglarse solo.

## Errores comunes

- **Crear la caché dentro del hook** (`useState(new Map())` o `useRef`). Cada componente tendría la suya y se perdería al desmontar: no sirve como caché compartida.
- **Reintentar todo, incluido un 404 o un 401.** Gastas peticiones y haces esperar al usuario 1,5 segundos para mostrar el mismo error.
- **No guardar el temporizador ni limpiarlo.** Si el usuario sale de la pantalla, los reintentos siguen saliendo y pueden actualizar un componente que ya no existe.
- **Reintentar en bucle sin límite** (`while (true)`, o sin contar intentos). Un servidor caído recibe peticiones para siempre.
- **Esperas fijas** (siempre 500 ms). Funciona, pero no le da al servidor más aire si sigue mal.
- **Usar un estado (no un ref) para `forzar`.** Provoca un render de más y, peor, puede quedar en `true` y saltarse la caché en el siguiente cambio de url.
- **Guardar errores en la caché.** La próxima vez entregarías un error viejo sin volver a intentar.

## Otra forma de resolverlo

Con `async/await` y un bucle `for`, que se lee como una receta. Para esperar se usa una promesa que se resuelve con el `setTimeout`:

```jsx
useEffect(() => {
  if (!forzar.current && cache.has(url)) { /* ... */ return; }
  forzar.current = false;
  let activo = true;
  let temporizador;
  const dormir = (ms) => new Promise((r) => { temporizador = setTimeout(r, ms); });

  (async () => {
    setEstado((e) => ({ ...e, error: null, cargando: true }));
    for (let numero = 0; ; numero++) {
      try {
        const r = await fetch(url);
        if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status });
        const datos = await r.json();
        if (!activo) return;
        cache.set(url, datos);
        return setEstado({ datos, error: null, cargando: false });
      } catch (error) {
        if (!activo) return;
        if (!esReintentable(error) || numero >= reintentos) {
          return setEstado({ datos: null, error, cargando: false });
        }
        await dormir(esperaBase * 2 ** numero);
        if (!activo) return;
      }
    }
  })();

  return () => { activo = false; clearTimeout(temporizador); };
}, [url, version]);
```

**¿Cuándo conviene?** Es más fácil de seguir si la lógica de reintentos crece (por ejemplo, respetar el encabezado `Retry-After` de un 429). En un proyecto real no escribirías esto: usarías **TanStack Query**, que trae `retry: 2`, `retryDelay` con backoff, caché por clave, `refetch` y deduplicación de peticiones iguales en vuelo. Saber cómo funciona por dentro es lo que te deja configurarla bien.

## Cómo explicarlo en la entrevista

> "El hook tiene una caché en un `Map` a nivel de módulo, con la url como clave, así que si otro componente pide lo mismo, los datos salen desde el primer render sin otra petición. Si la petición falla por la red o con un 5xx, reintenta hasta dos veces con backoff exponencial, 500 y luego 1000 milisegundos, para no saturar a un servidor que ya tiene problemas. Los 4xx no los reintento porque son errores de la petición y repetirla no los arregla. En la limpieza del efecto marco la ejecución como inactiva y cancelo el `setTimeout` pendiente, así que si cambia la url o se desmonta, no quedan reintentos fantasma. `recargar` fuerza una petición nueva ignorando la caché. En producción usaría TanStack Query, que hace esto y más."

## Conceptos

- **Hook personalizado** que devuelve estado y acciones (`recargar`).
- **Caché en memoria** a nivel de módulo con `Map`, clave por url.
- **Estado inicial perezoso**: `useState(() => ...)`.
- **Backoff exponencial**: `esperaBase * 2 ** intento`; *jitter* en producción.
- **Errores reintentables** (red, 5xx) vs. no reintentables (4xx).
- **Limpieza de temporizadores** y bandera `activo` en el efecto.
- **`useRef`** para señales que no se pintan; **`useCallback`** para una función estable.
- **TanStack Query / SWR**: `retry`, `retryDelay`, `staleTime`, `refetch`, deduplicación.
