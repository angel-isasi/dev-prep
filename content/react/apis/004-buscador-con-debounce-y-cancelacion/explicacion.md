## Idea clave

Un efecto con `[texto]` ya hace casi todo el trabajo: en cada tecla React **limpia** el efecto anterior y corre uno nuevo. Si el efecto programa la petición con `setTimeout` y la limpieza hace `clearTimeout`, solo sobrevive el temporizador de la última tecla: eso es el **debounce**. Y si la limpieza también hace `control.abort()`, una petición que ya salió se cancela cuando empieza otra búsqueda: así nunca gana una respuesta vieja.

## Paso a paso

1. **Input controlado.** `texto` en el estado, actualizado en `onChange`.
2. **Efecto con `[texto]`.** Primero `texto.trim()`: si queda vacío, vuelves al estado inicial y sales (sin temporizador ni petición).
3. **Marca "buscando"** de inmediato, para que el usuario vea que lo escuchaste aunque todavía no se pida nada.
4. **Crea el `AbortController`** de esta búsqueda.
5. **Programa la petición** con `setTimeout(..., 400)`. Dentro: `fetch` con `signal`, revisar `ok`, leer `cuerpo.datos`.
6. **Ignora el `AbortError`** en el `.catch`: lo provocaste tú al cancelar.
7. **Limpieza doble.** `clearTimeout(temporizador)` cancela la espera si el usuario siguió escribiendo; `control.abort()` cancela la petición si ya había salido.
8. **Codifica el texto.** `encodeURIComponent("disco ssd")` da `disco%20ssd`; sin eso, un `&` o un `#` en la búsqueda rompería la URL.

```jsx
useEffect(() => {
  const consulta = texto.trim();
  if (!consulta) { setEstado(INICIAL); return; }

  setEstado((e) => ({ ...e, tipo: "buscando" }));
  const control = new AbortController();
  const temporizador = setTimeout(() => {
    fetch(`/api/practica/productos?q=${encodeURIComponent(consulta)}`, { signal: control.signal })
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then((cuerpo) => setEstado({ tipo: "listo", productos: cuerpo.datos, consulta, error: null }))
      .catch((error) => { if (error.name !== "AbortError") setEstado({ tipo: "error", /* ... */ }); });
  }, 400);

  return () => { clearTimeout(temporizador); control.abort(); };
}, [texto]);
```

## Por qué funciona

Escribes `d`, `di` y `dis` con 100 ms entre teclas:

| Tiempo | Pasa | Temporizadores vivos | Peticiones |
|---|---|---|---|
| 0 ms | efecto de `d`: programa T1 | T1 | 0 |
| 100 ms | limpieza de `d` cancela T1; efecto de `di` programa T2 | T2 | 0 |
| 200 ms | limpieza cancela T2; efecto de `dis` programa T3 | T3 | 0 |
| 600 ms | T3 vence | ninguno | 1 (`?q=dis`) |

Si después escribes `disc` mientras `?q=dis` sigue en camino, la limpieza de `dis` llama `abort()`: el `fetch` de `dis` se rechaza con `AbortError`, que ignoras, y solo la respuesta de `disc` puede actualizar la pantalla. El debounce reduce las peticiones; el `abort` elimina la condición de carrera de las que igual salieron.

## Errores comunes

- **Crear el temporizador en el `onChange` sin guardarlo para cancelarlo.** Solo retrasas cada petición 400 ms: siguen saliendo todas.
- **Olvidar el `clearTimeout` en la limpieza.** Es el corazón del debounce: sin él, no hay debounce.
- **Abortar pero mostrar el `AbortError`.** Cada tecla haría parpadear "No se pudo buscar: The operation was aborted".
- **No codificar el texto.** Buscar `cargador 65 w & cable` manda dos parámetros en vez de uno.
- **Pedir con el texto vacío.** La API devolvería **todos** los productos, que no es lo que el usuario espera al borrar.
- **Un `AbortController` fuera del efecto (en un `useRef` que nunca se renueva).** Una vez abortado, un controlador queda abortado para siempre: las siguientes peticiones nacen canceladas.

## Otra forma de resolverlo

Separar el debounce en un hook reutilizable `useDebounce` y dejar el efecto de la petición limpio:

```jsx
function useDebounce(valor, ms) {
  const [demorado, setDemorado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setDemorado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return demorado;
}

// En el componente:
const consulta = useDebounce(texto.trim(), 400);
useEffect(() => {
  if (!consulta) return;
  const control = new AbortController();
  fetch(`/api/practica/productos?q=${encodeURIComponent(consulta)}`, { signal: control.signal })
    .then(/* ... */);
  return () => control.abort();
}, [consulta]);
```

**¿Cuándo conviene?** Cuando tienes varios buscadores o filtros en la app: `useDebounce` se escribe una vez y queda claro qué parte es "esperar" y qué parte es "pedir". Para mostrar "Buscando..." durante la espera, compara `texto.trim() !== consulta`.

## Cómo explicarlo en la entrevista

> "Para no pedir en cada tecla uso un debounce: el efecto depende del texto y programa la petición con un `setTimeout` de 400 ms; la limpieza hace `clearTimeout`, así que si el usuario sigue escribiendo, el temporizador anterior se cancela y solo el último llega a pedir. Además, cada búsqueda tiene su `AbortController`, y en la misma limpieza llamo `abort()`: si una petición ya había salido, se cancela y no puede pisar los resultados nuevos. El `AbortError` lo ignoro porque lo provoqué yo. Y codifico el texto con `encodeURIComponent`."

## Conceptos

- **Debounce**: ejecutar algo solo cuando pasa un tiempo sin nuevos eventos.
- **`setTimeout` y `clearTimeout`** dentro de un efecto.
- **Limpieza de `useEffect`**: corre antes de cada nueva ejecución y al desmontar.
- **`AbortController`**, `signal` y `abort()`: cancelar un `fetch`.
- **`AbortError`**: el rechazo que produce una cancelación; no se muestra.
- **`encodeURIComponent`**: codificar texto del usuario dentro de una URL.
- **Condición de carrera** en buscadores.
- **Throttle** (pariente del debounce): ejecutar como máximo una vez cada cierto tiempo.
