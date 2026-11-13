## Idea clave

El intervalo se crea **una vez por cada `ms`** y, en cada tic, llama a lo que haya en un **ref** (`ultimoCallback.current`). Ese ref se actualiza después de cada render con el callback nuevo. Así el intervalo nunca se reinicia por culpa del callback y nunca usa valores viejos del estado.

## Paso a paso

1. **Un ref para el callback**: `useRef(callback)`. Un ref es una "caja" (`{ current: ... }`) que persiste entre renders y que puedes modificar **sin provocar un render**.
2. **Actualiza el ref después de cada render**: `useEffect(() => { ultimoCallback.current = callback; })`. Sin arreglo de dependencias, corre después de **todos** los renders.
3. **Un segundo efecto para el intervalo**, que depende solo de `[ms]`:
   - Si `ms` es `null`, sale sin crear nada (pausado).
   - Si no, `setInterval(() => ultimoCallback.current(), ms)`. Fíjate que no llama a `callback` directo: lee el ref **en el momento del tic**.
   - Devuelve `() => clearInterval(id)`. React lo ejecuta antes de volver a correr el efecto (si cambió `ms`) y al desmontar.

```jsx
import { useEffect, useRef } from "react";

export function useIntervalo(callback, ms) {
  // Una "caja" que sobrevive entre renders y que podemos cambiar sin re-renderizar.
  const ultimoCallback = useRef(callback);

  // Después de cada render, guardamos el callback más reciente.
  useEffect(() => {
    ultimoCallback.current = callback;
  });

  // El intervalo solo depende de `ms`: cambiar el callback no lo reinicia.
  useEffect(() => {
    if (ms === null) return; // pausado

    const id = setInterval(() => ultimoCallback.current(), ms);
    return () => clearInterval(id); // limpia al cambiar ms o al desmontar
  }, [ms]);
}
```

## Por qué funciona

Con `useIntervalo(() => setN(n + 1), 1000)`:

| Momento | `n` en ese render | `ultimoCallback.current` | Qué hace el tic |
|---|---|---|---|
| Render 1 | `0` | `() => setN(0 + 1)` | |
| Tic a los 1000 ms | | | llama `setN(1)` |
| Render 2 | `1` | `() => setN(1 + 1)` (actualizado por el efecto) | |
| Tic a los 2000 ms | | | llama `setN(2)` |
| Render 3 | `2` | `() => setN(2 + 1)` | |

El intervalo es **el mismo** todo el tiempo (se creó en el render 1), pero en cada tic consulta el ref y encuentra el callback del último render, que "ve" el `n` actual.

¿Qué pasaría con la versión ingenua?

```jsx
useEffect(() => {
  const id = setInterval(callback, ms);
  return () => clearInterval(id);
}, []); // dependencias vacías
```

El intervalo guardaría el callback del **primer** render, donde `n` es `0`. Cada tic haría `setN(0 + 1)`: el contador se quedaría en 1 para siempre. Eso es un **closure viejo**. Y si pones `[callback, ms]` como dependencias, el intervalo se destruye y se recrea en cada render: con callbacks nuevos en cada render, el reloj vuelve a empezar desde cero y puede no dispararse nunca. Es lo que verifica el test de "no reinicia la cuenta".

## Errores comunes

- **Dependencias vacías y usar `callback` directo.** Closure viejo: el contador se queda en 1. Falla el primer test.
- **Poner `callback` en las dependencias del efecto del intervalo.** Se reinicia en cada render. Falla el test "cambiar el callback no reinicia".
- **Olvidar `clearInterval` en la limpieza.** Al desmontar, el intervalo sigue corriendo y llamando a `setState` de un componente que ya no existe; al cambiar `ms`, se acumulan intervalos. Falla "al desmontar deja de llamar".
- **Guardar el callback en un `useState`** en vez de un ref. Cada actualización provocaría otro render, que crea otro callback, que actualiza el estado... bucle infinito.
- **Comprobar `if (!ms)`** en vez de `ms === null`. Con `ms = 0` también lo pausarías; el enunciado dice que solo `null` pausa.

## Otra forma de resolverlo

Si solo necesitas un contador, puedes evitar el problema con la **forma funcional** del setter y un intervalo simple:

```jsx
import { useEffect, useState } from "react";

function Reloj() {
  const [segundos, setSegundos] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{segundos} s</p>;
}
```

**¿Cuándo conviene?** Cuando el callback solo actualiza un estado a partir del anterior: `setSegundos((s) => s + 1)` no necesita leer `segundos`, así que no hay closure viejo. `useIntervalo` con ref es la solución general: sirve cuando el callback lee props o varios estados (por ejemplo, "si `corriendo` y `nivel > 3`, suma 2"). Desde React 19.2 existe también el hook `useEffectEvent`, pensado justo para "leer lo último sin reiniciar el efecto": hace por dentro lo mismo que este ref.

## Cómo explicarlo en la entrevista

> "El problema de `setInterval` en un efecto es el closure viejo: el intervalo se queda con el callback del primer render y ve valores viejos del estado. Si pongo el callback en las dependencias, el intervalo se reinicia en cada render. Mi solución es guardar el callback en un `useRef`, actualizarlo después de cada render, y crear el intervalo en un efecto que solo depende de `ms`; en cada tic llamo a `ref.current`. Con `ms` en `null` lo pauso, y la limpieza hace `clearInterval` al cambiar el tiempo o al desmontar."

## Conceptos

- **Closure viejo** (stale closure): una función que recuerda valores de un render anterior.
- **`useRef`**: caja mutable que persiste entre renders y no provoca re-render al cambiar.
- **`useEffect` sin dependencias**: corre después de cada render.
- **`useEffect` con `[ms]`**: solo se repite si cambia `ms`.
- **Limpieza de efectos**: `clearInterval` al desmontar o antes de repetir.
- **`setInterval` / `clearInterval`**: temporizadores repetitivos del navegador.
- **Timers falsos** (`vi.useFakeTimers`, `vi.advanceTimersByTime`): probar tiempo sin esperar de verdad.
- **Forma funcional del setter**: alternativa cuando solo necesitas el estado anterior.
