## Idea clave

En una prueba **no se llama a la red**: se reemplaza `fetch` por una función falsa (un *mock*) que devuelve la respuesta que tú decides. Así puedes probar el caso bueno y el caso de error en milisegundos y siempre con el mismo resultado. Como los datos llegan después del primer render, se espera con `findBy...`.

## Paso a paso

1. **Guarda el `fetch` original** para restaurarlo al final. Si no lo haces, el mock se queda "pegado" y afecta a otras pruebas.
2. **Crea el mock del caso bueno** con `vi.fn(async () => ({ ok: true, json: async () => ({ titulo: "2x1 en familiares" }) }))`. Es una función asíncrona (devuelve una promesa, como el `fetch` real) que responde un objeto con `ok` y `json()`, lo único que el componente usa. Además, `vi.fn` la convierte en espía.
3. **Renderiza y espera**: al montar se ve "Cargando…"; el `useEffect` llama a tu fetch falso y, cuando la promesa se resuelve, el componente se vuelve a renderizar. `await screen.findByText(...)` reintenta la búsqueda hasta que el texto aparece (o se rinde al segundo).
4. **Comprueba la URL** con `toHaveBeenCalledWith("/api/promo")`.
5. **Limpia con `cleanup()`** para desmontar el primer `Promo`; si no, tendrías dos en pantalla.
6. **Crea el mock del caso malo** (`{ ok: false }`), vuelve a renderizar y espera el `alert` con `findByRole`.
7. **Restaura `fetch` en un `finally`**: se ejecuta aunque algún `expect` falle.

```jsx
import { expect, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

export async function probarPromo(Promo) {
  const fetchOriginal = globalThis.fetch;
  try {
    // 1. Respuesta buena: fetch falso que devuelve algo parecido a una Response.
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ titulo: "2x1 en familiares" }),
    }));
    render(<Promo />);
    expect(screen.getByText("Cargando…")).toBeTruthy();
    // findBy espera (hasta 1 segundo) a que el texto aparezca.
    expect(await screen.findByText("Promo: 2x1 en familiares")).toBeTruthy();
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/promo");

    // Desmonta lo anterior antes de probar otro caso.
    cleanup();

    // 2. Respuesta mala: el servidor responde con error (ok: false).
    globalThis.fetch = vi.fn(async () => ({ ok: false }));
    render(<Promo />);
    const alerta = await screen.findByRole("alert");
    expect(alerta.textContent).toBe("No pudimos cargar la promo");
  } finally {
    // Pase lo que pase, deja fetch como estaba.
    globalThis.fetch = fetchOriginal;
  }
}
```

## Por qué funciona

Recorrido del caso bueno:

| Momento | Estado del componente | Lo que se pinta |
|---|---|---|
| Primer render | `{ cargando: true }` | `Cargando…` |
| El efecto llama a `fetch("/api/promo")` | igual | `Cargando…` |
| Tu mock resuelve, `r.ok` es `true`, `r.json()` da la promo | `{ cargando: false, promo }` | `Promo: 2x1 en familiares` |

En el caso malo, `r.ok` es `false`, el componente hace `Promise.reject()`, cae en el `.catch` y el estado pasa a `{ error: true }`: se pinta el `alert`.

Y así atrapa tu prueba cada versión rota:

| Versión | Qué falla en tu prueba |
|---|---|
| URL equivocada `/api/promos` | `toHaveBeenCalledWith("/api/promo")` |
| No revisa `ok` | `findByRole("alert")` nunca lo encuentra y se rinde |
| Muestra `promo.nombre` | `findByText("Promo: 2x1 en familiares")` nunca lo encuentra |

## Errores comunes

- **Usar `getByText` en vez de `findByText`.** Justo después de `render` solo existe "Cargando…": `getBy` falla de inmediato. Para lo que llega después, `await findBy...`.
- **Olvidar el `await`** antes de `findBy...`. Sin él tienes una promesa, no un elemento, y la prueba no espera nada.
- **El mock no devuelve una promesa.** El componente hace `fetch(...).then(...)`; si tu mock devuelve un objeto normal, `.then` no existe y explota. Por eso `vi.fn(async () => ...)`.
- **Olvidar `json` como función asíncrona** (`json: { titulo: ... }`). El componente llama `r.json()` y falla con "r.json is not a function".
- **No restaurar `fetch`.** Las siguientes pruebas usarían tu mock sin saberlo. Con `try`/`finally` (o `vi.restoreAllMocks()` si usaste `vi.spyOn`) queda limpio.

## Otra forma de resolverlo

Con **`vi.spyOn`** y respuestas "una vez" (`mockResolvedValueOnce`):

```jsx
import { expect, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

export async function probarPromo(Promo) {
  const espia = vi.spyOn(globalThis, "fetch");
  try {
    espia.mockResolvedValueOnce({ ok: true, json: async () => ({ titulo: "2x1 en familiares" }) });
    render(<Promo />);
    expect(await screen.findByText("Promo: 2x1 en familiares")).toBeTruthy();
    expect(espia).toHaveBeenCalledWith("/api/promo");
    cleanup();

    espia.mockResolvedValueOnce({ ok: false });
    render(<Promo />);
    expect(await screen.findByRole("alert")).toBeTruthy();
  } finally {
    espia.mockRestore();
  }
}
```

**¿Cuándo conviene?** `vi.spyOn` + `mockRestore` es la forma más usada en proyectos con muchas pruebas, porque restaurar es una sola línea. Requiere que `fetch` ya exista en el entorno. Asignar `globalThis.fetch = vi.fn(...)` es más explícito y fácil de entender cuando estás empezando. En proyectos grandes también se usa **MSW** (Mock Service Worker), que simula el servidor en vez de `fetch`.

## Cómo explicarlo en la entrevista

> "En las pruebas no llamo a la API real: reemplazo `fetch` por un mock con `vi.fn` que devuelve una respuesta falsa con `ok` y `json`, que es lo único que usa el componente. Pruebo el caso bueno, esperando con `findByText` porque los datos llegan después del primer render, y verifico que se pidió la URL correcta. Luego, tras un `cleanup`, pruebo el caso de error con `ok: false` y espero el `alert`. Al final restauro el `fetch` original en un `finally` para no contaminar otras pruebas."

## Conceptos

- **Mock**: reemplazo falso de una dependencia (red, tiempo, etc.) para controlar su respuesta.
- **`vi.fn(async () => ...)`**: función espía que devuelve una promesa.
- **`findBy...`**: busca y espera (reintenta) hasta que el elemento aparece; devuelve una promesa.
- **`cleanup`**: desmonta lo renderizado para empezar limpio.
- **`try` / `finally`**: el `finally` se ejecuta siempre, falle o no lo de adentro.
- **`vi.spyOn` + `mockRestore`**: espiar un método existente y devolverlo a su estado original.
- **Probar el camino de error**: un `fetch` puede fallar; la interfaz debe decírselo al usuario.
