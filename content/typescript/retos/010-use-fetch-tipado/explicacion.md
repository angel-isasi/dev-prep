## Idea clave

El estado de una petición es **una** de tres situaciones, así que se modela como una **unión discriminada** (`cargando` | `exito` con `datos: T` | `error` con `error: string`) guardada en un solo `useState`. El hook es **genérico**: quien lo usa dice qué es `T` (`useFetch<Usuario[]>`). Dentro del efecto, una bandera `activo` evita que una respuesta vieja pise a la nueva.

## Paso a paso

1. **El tipo.** Tres variantes con `estado` literal. `datos` solo existe en `exito` y `error` solo en `error`: es imposible escribir "cargando con error".
2. **Un solo estado.** `useState<EstadoFetch<T>>({ estado: "cargando" })`. El genérico explícito es necesario: sin él, TypeScript deduciría solo `{ estado: string }` del valor inicial.
3. **El efecto depende de `[url, fetchFn]`.** Corre al montar y cada vez que cambia la url (o la función de fetch). Lo primero que hace es volver a `cargando`.
4. **Una función `async` dentro del efecto.** `useEffect` no puede recibir una función `async` (devolvería una promesa y React espera una función de limpieza). Se define `cargar` adentro y se llama.
5. **`try/catch`.** En el `try`: pides, revisas `ok` (un 404 no rechaza la promesa) y lees el JSON. Si algo lanza, el `catch` lo atrapa.
6. **`as T` en los datos.** `json()` devuelve `unknown`. El `as T` es un acuerdo: "confío en que la API cumple el tipo". Es el único punto de confianza del hook; si quieres validarlo de verdad, mira el reto "Cliente de API tipado".
7. **`catch (error)` es `unknown`.** En modo estricto TypeScript no asume que lo lanzado sea un `Error` (en JavaScript se puede lanzar cualquier cosa: `throw "texto"`). Con `error instanceof Error` lo estrechas y lees `message` sin riesgo.
8. **La bandera `activo`.** Cada ejecución del efecto tiene la suya (closure). La limpieza la pone en `false` cuando la url cambia o el componente se desmonta; antes de cada `setResultado` se revisa.
9. **`ListaUsuarios`.** Revisa `estado` con `if` y en cada rama TypeScript sabe qué hay: en la última, `resultado.datos` es `Usuario[]`.

```tsx
export function useFetch<T>(url: string, fetchFn: FetchFn): EstadoFetch<T> {
  const [resultado, setResultado] = useState<EstadoFetch<T>>({ estado: "cargando" });

  useEffect(() => {
    let activo = true;
    setResultado({ estado: "cargando" });

    async function cargar() {
      try {
        const respuesta = await fetchFn(url);
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = (await respuesta.json()) as T;
        if (activo) setResultado({ estado: "exito", datos });
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        if (activo) setResultado({ estado: "error", error: mensaje });
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [url, fetchFn]);

  return resultado;
}
```

## Por qué funciona

Recorrido de la condición de carrera: la url cambia de `/lenta` a `/rapida` y `/lenta` responde al final.

| Momento | Efecto de `/lenta` | Efecto de `/rapida` | `resultado` |
|---|---|---|---|
| Montaje con `/lenta` | `activo = true`, pide | | `{ estado: "cargando" }` |
| La url cambia | limpieza: `activo = false` | `activo = true`, pide | `{ estado: "cargando" }` |
| Responde `/rapida` | | `activo` es true: guarda | `{ estado: "exito", datos: "/rapida" }` |
| Responde `/lenta` (tarde) | `activo` es false: **no guarda** | | sigue con `/rapida` |

Y cómo estrecha TypeScript el tipo en `ListaUsuarios`:

| Línea | Tipo de `resultado` |
|---|---|
| después de `useFetch<Usuario[]>` | `EstadoFetch<Usuario[]>` (las 3 variantes) |
| dentro de `if (estado === "cargando")` | `{ estado: "cargando" }` |
| dentro de `if (estado === "error")` | `{ estado: "error"; error: string }` |
| después de los dos `return` | `{ estado: "exito"; datos: Usuario[] }` |

Por eso `resultado.datos.map(...)` compila al final sin `?.` ni `!`: los otros dos casos ya salieron con `return`.

## Errores comunes

- **Tres estados sueltos** (`datos`, `error`, `cargando`) o un tipo con todo opcional. Funciona, pero `r.datos` compila sin revisar nada y fallan los `@ts-expect-error`.
- **`useEffect(async () => ...)`.** El efecto devuelve una promesa en vez de una limpieza; React muestra una advertencia y la bandera `activo` nunca se apaga.
- **`catch (error) { error.message }`** sin estrechar. En modo estricto da error de tipos: "error es de tipo unknown". Usa `instanceof Error`.
- **No revisar `respuesta.ok`.** Un 404 termina en `exito` con el cuerpo de la página de error. Falla el test de "HTTP 404".
- **Olvidar la url en las dependencias** (`[]`). Solo pide la primera url. Falla "si la url cambia".
- **No volver a `cargando` al cambiar la url.** La pantalla muestra los datos viejos mientras llegan los nuevos, sin avisar.
- **Pasar un `fetchFn` nuevo en cada render**: `<ListaUsuarios fetchFn={(u) => fetch(u)} />` dentro de un componente que se re-renderiza. Como `fetchFn` está en las dependencias, cada render crea otra función, el efecto vuelve a correr, cambia el estado, hay otro render... un bucle de peticiones. Pásale `fetch` directamente o una función definida fuera del componente (o con `useCallback`).

## Otra forma de resolverlo

**Con `AbortController`**, que además de ignorar la respuesta vieja **cancela la petición**:

```tsx
useEffect(() => {
  const control = new AbortController();
  setResultado({ estado: "cargando" });

  fetch(url, { signal: control.signal })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<T>;
    })
    .then((datos) => setResultado({ estado: "exito", datos }))
    .catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return; // la cancelamos nosotros
      setResultado({ estado: "error", error: error instanceof Error ? error.message : "Error desconocido" });
    });

  return () => control.abort();
}, [url]);
```

Para esto `fetchFn` tendría que aceptar un segundo parámetro con `signal`, por eso el ejercicio usa la bandera.

**¿Cuándo conviene?** `AbortController` ahorra red cuando las peticiones son muchas o pesadas (un buscador que pide con cada tecla). La bandera `activo` es más simple y sirve con cualquier promesa. En proyectos reales se usa **TanStack Query**, que devuelve justamente un estado discriminado (`status: "pending" | "error" | "success"`) además de caché y reintentos.

## Cómo explicarlo en la entrevista

> "El hook es genérico en T y devuelve una unión discriminada: cargando, éxito con `datos: T` o error con el mensaje. Así quien lo usa tiene que revisar el estado antes de tocar los datos y TypeScript estrecha el tipo en cada rama; no existen combinaciones raras como cargando con error. En el efecto uso una función async con try/catch, reviso `ok` porque fetch no falla con un 404, y en el catch el error es `unknown`, así que lo estrecho con `instanceof Error`. Para la condición de carrera, una bandera `activo` que la limpieza pone en false. El `as T` del JSON es el único punto de confianza; si necesito garantías, valido con un type guard o Zod."

## Conceptos

- **Hooks personalizados genéricos** (tema de Aprender: React con TypeScript).
- **Uniones discriminadas** para estados de carga (tema de Aprender: uniones y narrowing).
- **`useState<T>`** con genérico explícito.
- **`useEffect` con dependencias** y **función de limpieza**.
- **Funciones async dentro de un efecto**.
- **`catch (error)` es `unknown`** y se estrecha con `instanceof Error`.
- **`as T`**: aserción de tipo, un acuerdo de confianza (no valida nada).
- **Condición de carrera** y la bandera `activo` (closure).
- **`fetch` y `respuesta.ok`**.
- **`AbortController`** para cancelar peticiones.
- **Referencias estables** en dependencias (`useCallback`).
