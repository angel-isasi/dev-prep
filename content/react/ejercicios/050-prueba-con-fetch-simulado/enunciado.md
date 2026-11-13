Te damos el componente `Promo`, que pide la promoción del día a `/api/promo` con `fetch`. Tú escribes **su prueba** sin usar la red real: reemplazas `fetch` por una función falsa que responde lo que tú quieras.

```jsx
// El componente que vas a probar (no lo modificas).
function Promo() {
  const [estado, setEstado] = useState({ cargando: true, promo: null, error: false });
  useEffect(() => {
    fetch("/api/promo")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((promo) => setEstado({ cargando: false, promo, error: false }))
      .catch(() => setEstado({ cargando: false, promo: null, error: true }));
  }, []);
  if (estado.cargando) return <p>Cargando…</p>;
  if (estado.error) return <p role="alert">No pudimos cargar la promo</p>;
  return <p>Promo: {estado.promo.titulo}</p>;
}
```

## Reglas

- Exporta `async function probarPromo(Promo)`. Renderiza **el `Promo` que recibes**.
- Reemplaza `fetch` con `globalThis.fetch = vi.fn(async () => respuestaFalsa)`. La respuesta falsa solo necesita lo que el componente usa: `ok` y, si `ok` es `true`, un método `json()` asíncrono.
- Prueba **dos casos**:
  1. **Respuesta buena** (`ok: true`, `json` devuelve `{ titulo: "2x1 en familiares" }`): aparece **"Promo: 2x1 en familiares"** y `fetch` se llamó con **`"/api/promo"`**.
  2. **Respuesta mala** (`ok: false`): aparece un elemento con rol **`alert`** y el texto **"No pudimos cargar la promo"**.
- Entre un caso y otro, desmonta lo renderizado con `cleanup()`.
- Los datos llegan **después** del primer render: usa `await screen.findBy...`, que espera a que aparezcan.
- Al terminar (aunque algo falle), **deja `fetch` como estaba** (`try` / `finally`).
- La app corre tu prueba contra el componente correcto (no debe fallar) y contra 3 versiones con errores (debe fallar en cada una).

## Ejemplo

| Tu `fetch` falso responde | Se ve | Comprueba |
|---|---|---|
| (todavía nada) | `Cargando…` | opcional: que se ve "Cargando…" |
| `{ ok: true, json: async () => ({ titulo: "2x1 en familiares" }) }` | `Promo: 2x1 en familiares` | el texto y la URL pedida |
| `{ ok: false }` | `No pudimos cargar la promo` | el `alert` |

| Versión del Promo | Tu prueba debe... |
|---|---|
| Correcta | pasar |
| Pide `/api/promos` (URL equivocada) | fallar |
| No revisa `ok` y nunca muestra la alerta | fallar |
| Muestra un campo que no existe en vez del título | fallar |

## Por qué importa

Ninguna prueba seria llama a una API real: sería lenta, dependería de internet y del servidor, y fallaría por motivos ajenos a tu código. Simular `fetch` y probar **también el caso de error** es una de las habilidades de testing que más se valora en un junior.
