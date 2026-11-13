## Idea clave

Un **hook personalizado** es una función que empieza con `use` y usa otros hooks. `useAsync` encapsula el patrón "cargando / listo / error" que repetirías en cada componente: guarda las fases en un solo estado y te da una función `ejecutar` que llama a la función asíncrona dentro de un `try/catch`.

## Paso a paso

1. **Un solo objeto de estado**: `{ fase, dato, error }`. Con tres `useState` separados podrías quedar, por un descuido, con `fase: "listo"` y un `error` viejo. Al actualizar el objeto completo, los tres cambian siempre juntos.
2. **`ejecutar` es `async` y recibe `...args`**: así sirve para cualquier función, tenga los parámetros que tenga, y se los pasa tal cual con `fn(...args)`.
3. **Antes de esperar**, pone `fase: "cargando"` y limpia `dato` y `error`.
4. **`try`**: `await fn(...args)`. Si sale bien, guarda `fase: "listo"` con el dato y lo **devuelve**, por si quien llama lo necesita (por ejemplo, para navegar a otra página con el id creado).
5. **`catch`**: guarda `fase: "error"` con el objeto de error. No lo relanza: el componente se entera por el estado, y así un clic no provoca un "Uncaught (in promise)" en la consola.
6. **`useCallback(..., [fn])`**: sin él, `ejecutar` sería una función nueva en cada render. Si un componente la pusiera en las dependencias de un `useEffect`, el efecto correría en cada render (y si el efecto llama a `ejecutar`, que cambia el estado, tendrías un bucle infinito).
7. **Devuelve `{ ...estado, ejecutar }`**: el spread pone `fase`, `dato` y `error` al mismo nivel que `ejecutar`, para desestructurar cómodo.

```jsx
import { useCallback, useState } from "react";

export function useAsync(fn) {
  const [estado, setEstado] = useState({ fase: "inicial", dato: null, error: null });

  const ejecutar = useCallback(
    async (...args) => {
      setEstado({ fase: "cargando", dato: null, error: null });
      try {
        const dato = await fn(...args);
        setEstado({ fase: "listo", dato, error: null });
        return dato;
      } catch (error) {
        setEstado({ fase: "error", dato: null, error });
      }
    },
    [fn],
  );

  return { ...estado, ejecutar };
}
```

## Por qué funciona

Recorrido con `doble` (que lanza error si `n < 0`):

| Momento | Qué pasa | `estado` |
|---|---|---|
| Primer render | `useState` con el valor inicial | `{ fase: "inicial", dato: null, error: null }` |
| `ejecutar(21)` | `setEstado` cargando, luego `await doble(21)` | `{ fase: "cargando", ... }` |
| La promesa resuelve con 42 | `setEstado` listo, `return 42` | `{ fase: "listo", dato: 42, error: null }` |
| `ejecutar(-1)` | cargando, luego `doble(-1)` lanza | `{ fase: "cargando", ... }` |
| El `await` rechaza | salta al `catch` | `{ fase: "error", dato: null, error: Error("negativo") }` |

Detalle importante: `await` sobre una promesa rechazada **lanza** el error en esa línea, por eso el `try/catch` funciona con código asíncrono igual que con código normal.

En los tests, `act(async () => { await ... })` le dice a React: "espera a que termine esto y aplica todos los cambios de estado antes de que yo revise". Sin `act`, el test leería el estado viejo.

## Errores comunes

- **No usar `useCallback`.** El hook funciona, pero `ejecutar` cambia en cada render. Lo reconoces porque el test "ejecutar es la misma función" falla, y en la vida real porque un `useEffect(() => { ejecutar(); }, [ejecutar])` se vuelve un bucle.
- **Relanzar el error** (`throw error` en el `catch`). Todo `onClick={() => ejecutar()}` generaría un error no capturado. Si quieres esa opción, que sea explícita.
- **Olvidar el `await`** (`const dato = fn(...args)`). `dato` sería una promesa, no el valor, y el `catch` nunca atraparía nada.
- **Tres `useState` separados** y olvidar limpiar uno: queda un `error` viejo visible junto al dato nuevo.
- **Pasar una función nueva en cada render** (`useAsync(async (n) => n * 2)` dentro del componente). Entonces `fn` cambia siempre y `useCallback` no sirve. Define la función fuera del componente o memorízala.

## Otra forma de resolverlo

Ignorar respuestas viejas si se llama a `ejecutar` dos veces seguidas (por ejemplo, en un buscador), con un contador en un `useRef`:

```jsx
import { useCallback, useRef, useState } from "react";

export function useAsync(fn) {
  const [estado, setEstado] = useState({ fase: "inicial", dato: null, error: null });
  const ultimaLlamada = useRef(0);

  const ejecutar = useCallback(
    async (...args) => {
      const numero = ++ultimaLlamada.current;
      setEstado({ fase: "cargando", dato: null, error: null });
      try {
        const dato = await fn(...args);
        if (numero === ultimaLlamada.current) setEstado({ fase: "listo", dato, error: null });
        return dato;
      } catch (error) {
        if (numero === ultimaLlamada.current) setEstado({ fase: "error", dato: null, error });
      }
    },
    [fn],
  );

  return { ...estado, ejecutar };
}
```

**¿Cuándo conviene?** Cuando las llamadas pueden solaparse y llegar en desorden (la respuesta de "pi" llega después de la de "pizza"). Para un botón de "Guardar" o "Calcular" no hace falta. En proyectos grandes se usan librerías como TanStack Query, que además manejan caché y reintentos.

## Cómo explicarlo en la entrevista

> "Extraje el patrón de carga a un hook personalizado. Guarda fase, dato y error en un solo objeto para que cambien siempre juntos, y expone `ejecutar`, que pone la fase en cargando, hace `await` de la función dentro de un `try/catch` y guarda listo o error. No relanzo el error porque el componente se entera por el estado. `ejecutar` va en `useCallback` para que su referencia sea estable y se pueda usar en dependencias de efectos sin bucles. Si las llamadas pudieran solaparse, agregaría un ref para descartar respuestas viejas."

## Conceptos

- **Hook personalizado**: función que empieza con `use` y reutiliza lógica con estado entre componentes.
- **`async` / `await`**: esperar una promesa como si fuera código secuencial.
- **`try/catch` con `await`**: una promesa rechazada lanza el error en la línea del `await`.
- **`useCallback`**: devuelve la misma función entre renders mientras no cambien sus dependencias.
- **Referencia estable**: importante para las dependencias de `useEffect`, `useMemo` y `memo`.
- **Estado como objeto**: agrupar datos que siempre cambian juntos.
- **`renderHook` y `act`**: herramientas de Testing Library para probar hooks y esperar sus actualizaciones.
