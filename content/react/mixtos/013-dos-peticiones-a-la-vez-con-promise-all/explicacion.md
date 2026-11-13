## Idea clave

Si dos peticiones no dependen entre sí, **lánzalas juntas** con `Promise.all`: el tiempo total es el de la más lenta, no la suma. Dentro del `useEffect`, una bandera `vigente` evita actualizar el estado si el componente ya se desmontó.

## Paso a paso

1. **Estados**: `datos` (empieza en `null`, que significa "cargando") y `error`.
2. **El efecto** se ejecuta al montar. Ahí llamas a `obtenerMenu()` y `obtenerPromos()` **dentro del mismo arreglo**: las dos arrancan en ese instante.
3. **`Promise.all`** devuelve una promesa que se cumple cuando **todas** se cumplen, con los resultados en el mismo orden: `[menu, promos]`. Si **una** falla, se rechaza de inmediato.
4. **`.then` y `.catch`** guardan los datos o marcan el error, siempre preguntando antes `if (vigente)`.
5. **Limpieza**: el `return () => { vigente = false; }` corre al desmontar (o antes de repetir el efecto si cambian las dependencias).
6. **Render por casos**: error, cargando o datos, con *early returns*.

```jsx
import { useEffect, useState } from "react";

export function Panel({ obtenerMenu, obtenerPromos }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;

    Promise.all([obtenerMenu(), obtenerPromos()])
      .then(([menu, promos]) => {
        if (vigente) setDatos({ menu, promos });
      })
      .catch(() => {
        if (vigente) setError(true);
      });

    return () => {
      vigente = false;
    };
  }, [obtenerMenu, obtenerPromos]);

  if (error) return <p role="alert">No se pudo cargar el panel</p>;
  if (!datos) return <p>Cargando…</p>;
  return (
    <p>
      {datos.menu.length} pizzas y {datos.promos.length} promos
    </p>
  );
}
```

## Por qué funciona

Supón que el menú tarda 300 ms y las promos 200 ms:

| Forma | Línea de tiempo | Total |
|---|---|---|
| `await obtenerMenu()` y luego `await obtenerPromos()` | menú 0 a 300, promos 300 a 500 | **500 ms** |
| `Promise.all([obtenerMenu(), obtenerPromos()])` | menú 0 a 300, promos 0 a 200 (en paralelo) | **300 ms** |

La clave es que **llamar** a una función async ya arranca la petición; `Promise.all` solo espera. Por eso el test puede comprobar que `obtenerPromos` se llamó aunque el menú todavía no haya terminado.

Recorrido de renders del ejemplo: render 1 con `datos = null` muestra `Cargando…`; el efecto lanza las peticiones; llegan los dos resultados; `setDatos({ menu: [a, b, c], promos: [2x1] })`; render 2 muestra `3 pizzas y 1 promos`.

La bandera `vigente` funciona por closure: cada ejecución del efecto tiene **su propia** variable `vigente`. La limpieza de esa ejecución la pone en `false`, y el `.then` de esa misma ejecución la lee.

## Errores comunes

- **Dos `await` seguidos** para cosas independientes. Funciona, pero tarda la suma de los tiempos. Es justo lo que el entrevistador quiere que evites.
- **`useEffect(async () => {...})`.** Un efecto no puede ser `async`, porque debe devolver una función de limpieza (o nada), no una promesa. React muestra una advertencia.
- **Olvidar el `.catch`.** Si una petición falla, la promesa rechazada queda sin manejar y el usuario ve "Cargando…" para siempre.
- **No incluir las funciones en las dependencias.** Si el padre cambia `obtenerMenu`, el panel no volvería a pedir. Ojo: si el padre las crea en cada render sin `useCallback`, el efecto se repetiría en cada render.
- **Pensar que `Promise.all` "hace" las peticiones en paralelo.** Lo que las hace paralelas es llamarlas sin esperar; `Promise.all` solo junta los resultados.

## Otra forma de resolverlo

Con `async/await` dentro de una función interna del efecto:

```jsx
useEffect(() => {
  let vigente = true;

  async function cargar() {
    try {
      const [menu, promos] = await Promise.all([obtenerMenu(), obtenerPromos()]);
      if (vigente) setDatos({ menu, promos });
    } catch {
      if (vigente) setError(true);
    }
  }

  cargar();
  return () => {
    vigente = false;
  };
}, [obtenerMenu, obtenerPromos]);
```

**¿Cuándo conviene?** Cuando la lógica tiene varios pasos (por ejemplo, transformar los datos antes de guardarlos): `try/catch` con `await` se lee de arriba abajo como código normal. Con una sola operación, `.then/.catch` es igual de claro. En apps grandes, librerías como TanStack Query manejan carga, errores y caché por ti.

## Cómo explicarlo en la entrevista

> "Como el menú y las promos no dependen entre sí, los pido en paralelo dentro del `useEffect` con `Promise.all`: así espero lo que tarda la más lenta y no la suma. Muestro 'Cargando…' mientras `datos` es null, y si cualquiera falla, el catch muestra un mensaje de error. Uso una bandera `vigente` que pongo en false en la limpieza del efecto, para no actualizar el estado si el componente se desmontó o si el efecto se volvió a ejecutar."

## Conceptos

- **`Promise.all`**: espera varias promesas; se cumple con todos los resultados o se rechaza con el primer error.
- **Paralelo vs secuencial**: llamar sin `await` arranca la tarea al instante.
- **`useEffect` para cargar datos**: los efectos sincronizan el componente con algo externo.
- **Bandera `vigente`**: evita actualizar estado de un efecto que ya fue limpiado.
- **Función de limpieza**: se ejecuta al desmontar o antes de repetir el efecto.
- **Estados de carga**: cargando, error y listo.
- **Desestructuración de resultados**: `([menu, promos]) => ...`.
